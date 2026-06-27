"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import KiRevolutionLogo from "@/components/KiRevolutionLogo";

type Msg = {
  id: string;
  nickname: string;
  kind: "text" | "voice" | "system";
  content: string;
  createdAt: string;
  userId?: string | null;
};

type Participant = {
  id: string;
  nickname: string;
  inVoice: boolean;
  speaking: boolean;
  isAdmin: boolean;
  canSpeak: boolean;
};

const ROOM = "main";
// Default until the server's ICE config (incl. TURN) is fetched.
const DEFAULT_ICE: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function api(path: string, body: unknown) {
  return fetch(`/api/chat/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

export default function ChatRoom() {
  const [phase, setPhase] = useState<"join" | "room">("join");
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [users, setUsers] = useState<Participant[]>([]);
  const [input, setInput] = useState("");
  const [joining, setJoining] = useState(false);

  // Voice state
  const [inVoice, setInVoice] = useState(false);
  const [micActive, setMicActive] = useState(false); // true once our mic stream is live
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [sttOn, setSttOn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Admin audio-routing (Windows 11): pick the AI's virtual mic/speaker.
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [micDeviceId, setMicDeviceId] = useState("");
  const [outputDeviceId, setOutputDeviceId] = useState("");

  // Refs (mutable, accessed from async callbacks)
  const userIdRef = useRef<string | null>(null);
  const nicknameRef = useRef("");
  const isAdminRef = useRef(false);
  const canSpeakRef = useRef(false);
  const lastTsRef = useRef<string>("");
  const seenIds = useRef<Set<string>>(new Set());
  const inVoiceRef = useRef(false);
  const speakingRef = useRef(false);
  const mutedRef = useRef(false);
  const micDeviceIdRef = useRef("");
  const outputDeviceIdRef = useRef("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const peerCanSpeak = useRef<Map<string, boolean>>(new Map());
  const audioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const recognitionRef = useRef<any>(null);
  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_ICE);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const stopSpeakingRef = useRef<() => void>(() => {});

  useEffect(() => {
    inVoiceRef.current = inVoice;
  }, [inVoice]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const saved = localStorage.getItem("chat_nickname");
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ---------- Join ----------
  const join = useCallback(async () => {
    const name = nickname.trim().slice(0, 24);
    if (!name) return;
    setJoining(true);
    try {
      // Load ICE/TURN config (best-effort) so voice works across networks.
      fetch("/api/chat/ice")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.iceServers) && d.iceServers.length) iceServersRef.current = d.iceServers;
        })
        .catch(() => {});

      const res = await api("join", { nickname: name, room: ROOM });
      if (res.userId) {
        localStorage.setItem("chat_nickname", name);
        userIdRef.current = res.userId;
        nicknameRef.current = res.nickname;
        isAdminRef.current = !!res.isAdmin;
        canSpeakRef.current = !!res.canSpeak;
        setUserId(res.userId);
        setIsAdmin(!!res.isAdmin);
        setCanSpeak(!!res.canSpeak);
        setPhase("room");
      }
    } finally {
      setJoining(false);
    }
  }, [nickname]);

  // ---------- Messages ----------
  const ingestMessages = useCallback((incoming: Msg[]) => {
    if (!incoming?.length) return;
    const fresh = incoming.filter((m) => !seenIds.current.has(m.id));
    if (!fresh.length) return;
    for (const m of fresh) seenIds.current.add(m.id);
    lastTsRef.current = fresh[fresh.length - 1].createdAt;
    setMessages((prev) => [...prev, ...fresh].slice(-300));
  }, []);

  // React to the admin granting/revoking my own speaking permission.
  const applyMyPermission = useCallback((nextCanSpeak: boolean) => {
    if (nextCanSpeak === canSpeakRef.current) return;
    canSpeakRef.current = nextCanSpeak;
    setCanSpeak(nextCanSpeak);

    // If I'm in the audio room and just LOST the mic, downgrade to listener now
    // (no permission prompt needed). Gaining the mic requires a user tap — see
    // the "Mikro aktivieren" button — because mobile blocks getUserMedia without a gesture.
    if (inVoiceRef.current && !nextCanSpeak && localStreamRef.current) {
      rejoinVoice(); // speaker -> listener
    }
    if (!nextCanSpeak) setSttOn(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Main poll loop ----------
  useEffect(() => {
    if (phase !== "room") return;
    let active = true;

    const tick = async () => {
      if (!active || !userIdRef.current) return;
      try {
        const res = await api("poll", {
          userId: userIdRef.current,
          room: ROOM,
          after: lastTsRef.current || undefined,
          inVoice: inVoiceRef.current,
          speaking: speakingRef.current,
        });
        if (!active) return;
        if (res.messages) ingestMessages(res.messages);
        if (res.users) {
          setUsers(res.users);
          const me = res.users.find((u: Participant) => u.id === userIdRef.current);
          if (me && !isAdminRef.current) applyMyPermission(!!me.canSpeak);
          // remember each peer's speaking permission for mesh relevance
          peerCanSpeak.current = new Map(
            res.users.map((u: Participant) => [u.id, !!u.canSpeak || !!u.isAdmin]),
          );
          if (inVoiceRef.current) syncPeers(res.users);
        }
      } catch {
        /* keep polling */
      }
    };

    tick();
    const iv = setInterval(tick, 1500);
    return () => {
      active = false;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ingestMessages, applyMyPermission]);

  // ---------- Send ----------
  const sendMessage = useCallback(async (text: string, kind: "text" | "voice" = "text") => {
    const content = text.trim();
    if (!content || !userIdRef.current) return;
    await api("send", {
      userId: userIdRef.current,
      room: ROOM,
      nickname: nicknameRef.current,
      content,
      kind,
    });
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;
      setInput("");
      sendMessage(text, "text");
    },
    [input, sendMessage],
  );

  // ================= WebRTC voice mesh =================

  const attachAudio = useCallback((peerId: string, stream: MediaStream) => {
    let el = audioElsRef.current.get(peerId);
    if (!el) {
      el = document.createElement("audio");
      el.autoplay = true;
      (el as any).playsInline = true;
      audioElsRef.current.set(peerId, el);
      audioContainerRef.current?.appendChild(el);
    }
    el.srcObject = stream;
    // Admin can route channel sound to a chosen output (e.g. the AI's input).
    if (outputDeviceIdRef.current && (el as any).setSinkId) {
      (el as any).setSinkId(outputDeviceIdRef.current).catch(() => {});
    }
    el.play().catch(() => {});
  }, []);

  const closePeer = useCallback((peerId: string) => {
    const pc = peersRef.current.get(peerId);
    if (pc) {
      try {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.close();
      } catch {
        /* ignore */
      }
      peersRef.current.delete(peerId);
    }
    const el = audioElsRef.current.get(peerId);
    if (el) {
      el.srcObject = null;
      el.remove();
      audioElsRef.current.delete(peerId);
    }
  }, []);

  const createPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      peersRef.current.set(peerId, pc);

      const stream = localStreamRef.current;
      if (stream) {
        // Speaker: send our mic.
        for (const track of stream.getTracks()) pc.addTrack(track, stream);
      } else if (initiator) {
        // Listener making the offer needs an m-line to receive on.
        // (As answerer, the remote offer already supplies the audio m-line.)
        try {
          pc.addTransceiver("audio", { direction: "recvonly" });
        } catch {
          /* ignore */
        }
      }

      pc.ontrack = (ev) => attachAudio(peerId, ev.streams[0]);

      pc.onicecandidate = (ev) => {
        if (ev.candidate && userIdRef.current) {
          api("signal", {
            room: ROOM,
            fromId: userIdRef.current,
            toId: peerId,
            kind: "ice",
            payload: JSON.stringify(ev.candidate),
          }).catch(() => {});
        }
      };

      if (initiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (userIdRef.current) {
              api("signal", {
                room: ROOM,
                fromId: userIdRef.current,
                toId: peerId,
                kind: "offer",
                payload: JSON.stringify(pc.localDescription),
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }

      return pc;
    },
    [attachAudio],
  );

  // Reconcile peer connections with current voice participants.
  // Only connect a pair if at least one of them can speak (avoids useless listener<->listener links).
  const syncPeers = useCallback(
    (participants: Participant[]) => {
      const me = userIdRef.current;
      if (!me) return;
      const iSpeak = canSpeakRef.current || isAdminRef.current;
      const wanted = new Set<string>();
      for (const p of participants) {
        if (p.id === me || !p.inVoice) continue;
        const theySpeak = p.canSpeak || p.isAdmin;
        if (iSpeak || theySpeak) wanted.add(p.id);
      }
      for (const id of wanted) {
        if (!peersRef.current.has(id)) createPeer(id, me > id);
      }
      for (const id of Array.from(peersRef.current.keys())) {
        if (!wanted.has(id)) closePeer(id);
      }
    },
    [createPeer, closePeer],
  );

  const handleSignal = useCallback(
    async (sig: { fromId: string; kind: string; payload: string }) => {
      const me = userIdRef.current;
      if (!me || !inVoiceRef.current) return;
      const from = sig.fromId;

      if (sig.kind === "offer") {
        const pc = createPeer(from, false);
        try {
          await pc.setRemoteDescription(JSON.parse(sig.payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await api("signal", {
            room: ROOM,
            fromId: me,
            toId: from,
            kind: "answer",
            payload: JSON.stringify(pc.localDescription),
          });
        } catch {
          /* ignore */
        }
      } else if (sig.kind === "answer") {
        const pc = peersRef.current.get(from);
        if (pc) await pc.setRemoteDescription(JSON.parse(sig.payload)).catch(() => {});
      } else if (sig.kind === "ice") {
        const pc = peersRef.current.get(from);
        if (pc) await pc.addIceCandidate(JSON.parse(sig.payload)).catch(() => {});
      } else if (sig.kind === "bye") {
        closePeer(from);
      }
    },
    [createPeer, closePeer],
  );

  useEffect(() => {
    if (!inVoice) return;
    let active = true;
    const tick = async () => {
      if (!active || !userIdRef.current) return;
      try {
        const r = await fetch(`/api/chat/signal?userId=${userIdRef.current}`);
        const data = await r.json();
        if (!active) return;
        for (const sig of data.signals || []) await handleSignal(sig);
      } catch {
        /* ignore */
      }
    };
    const iv = setInterval(tick, 1000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [inVoice, handleSignal]);

  // ---------- Devices (admin only) ----------
  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setInputs(list.filter((d) => d.kind === "audioinput"));
      setOutputs(list.filter((d) => d.kind === "audiooutput"));
    } catch {
      /* ignore */
    }
  }, []);

  // ---------- Speaking detection (local mic) ----------
  const startSpeakingDetection = useCallback((stream: MediaStream) => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const loop = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const level = sum / data.length;
        const isSpeaking = level > 12 && !mutedRef.current;
        if (isSpeaking !== speakingRef.current) {
          speakingRef.current = isSpeaking;
          setSpeaking(isSpeaking);
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
      return () => {
        cancelAnimationFrame(raf);
        ctx.close().catch(() => {});
      };
    } catch {
      return () => {};
    }
  }, []);

  // ---------- Join / leave / rejoin voice ----------
  const joinVoice = useCallback(async () => {
    try {
      const iSpeak = canSpeakRef.current || isAdminRef.current;
      if (iSpeak) {
        const constraints: MediaStreamConstraints = {
          audio: micDeviceIdRef.current
            ? { deviceId: { exact: micDeviceIdRef.current }, echoCancellation: true, noiseSuppression: true }
            : { echoCancellation: true, noiseSuppression: true },
          video: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        for (const t of stream.getAudioTracks()) t.enabled = !mutedRef.current;
        stopSpeakingRef.current = startSpeakingDetection(stream);
        setMicActive(true);
        if (isAdminRef.current) refreshDevices();
      }
      setInVoice(true);
      inVoiceRef.current = true;
    } catch (e) {
      alert("Mikrofon konnte nicht aktiviert werden. Bitte Zugriff erlauben.");
    }
  }, [refreshDevices, startSpeakingDetection]);

  const teardownVoice = useCallback(() => {
    const me = userIdRef.current;
    for (const id of Array.from(peersRef.current.keys())) {
      if (me) api("signal", { room: ROOM, fromId: me, toId: id, kind: "bye", payload: "" }).catch(() => {});
      closePeer(id);
    }
    stopSpeakingRef.current?.();
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) t.stop();
      localStreamRef.current = null;
    }
    setMicActive(false);
    speakingRef.current = false;
    setSpeaking(false);
  }, [closePeer]);

  const leaveVoice = useCallback(() => {
    teardownVoice();
    setInVoice(false);
    inVoiceRef.current = false;
  }, [teardownVoice]);

  // Used when role changes (listener <-> speaker): rebuild cleanly.
  const rejoinVoice = useCallback(() => {
    teardownVoice();
    // small async gap so peers process our "bye" before we re-offer
    setTimeout(() => {
      if (inVoiceRef.current) joinVoice();
    }, 300);
  }, [teardownVoice, joinVoice]);

  // Listener -> speaker after the admin unlocks you. Runs from a tap so the
  // mic permission prompt is allowed on mobile.
  const upgradeToSpeaker = useCallback(async () => {
    const me = userIdRef.current;
    for (const id of Array.from(peersRef.current.keys())) {
      if (me) api("signal", { room: ROOM, fromId: me, toId: id, kind: "bye", payload: "" }).catch(() => {});
      closePeer(id);
    }
    await joinVoice(); // acquires mic; the poll loop rebuilds peers as a speaker
  }, [closePeer, joinVoice]);

  const changeMic = useCallback(
    async (deviceId: string) => {
      setMicDeviceId(deviceId);
      micDeviceIdRef.current = deviceId;
      if (!inVoiceRef.current || !localStreamRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true },
          video: false,
        });
        const newTrack = stream.getAudioTracks()[0];
        for (const pc of peersRef.current.values()) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
          if (sender) await sender.replaceTrack(newTrack);
        }
        if (localStreamRef.current) for (const t of localStreamRef.current.getTracks()) t.stop();
        localStreamRef.current = stream;
        newTrack.enabled = !mutedRef.current;
        stopSpeakingRef.current?.();
        stopSpeakingRef.current = startSpeakingDetection(stream);
      } catch {
        alert("Audioquelle konnte nicht gewechselt werden.");
      }
    },
    [startSpeakingDetection],
  );

  const changeOutput = useCallback((deviceId: string) => {
    setOutputDeviceId(deviceId);
    outputDeviceIdRef.current = deviceId;
    for (const el of audioElsRef.current.values()) {
      if ((el as any).setSinkId) (el as any).setSinkId(deviceId).catch(() => {});
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (localStreamRef.current) {
        for (const t of localStreamRef.current.getAudioTracks()) t.enabled = !next;
      }
      return next;
    });
  }, []);

  // ---------- Admin: grant / revoke speaking ----------
  const setGuestSpeak = useCallback((targetUserId: string, allow: boolean) => {
    api("grant", { targetUserId, canSpeak: allow, room: ROOM }).catch(() => {});
  }, []);

  // ---------- Speech-to-text (speakers only) ----------
  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!sttOn) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
      return;
    }
    if (!SR) {
      alert("Spracherkennung wird von diesem Browser nicht unterstützt.");
      setSttOn(false);
      return;
    }
    const rec = new SR();
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) {
          const text = ev.results[i][0].transcript.trim();
          if (text) sendMessage(text, "voice");
        }
      }
    };
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      }
    };
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      /* ignore */
    }
    return () => {
      recognitionRef.current = null;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
  }, [sttOn, sendMessage]);

  // ---------- Unload cleanup ----------
  useEffect(() => {
    const leave = () => {
      if (userIdRef.current) {
        navigator.sendBeacon?.(
          "/api/chat/leave",
          new Blob(
            [JSON.stringify({ userId: userIdRef.current, room: ROOM, nickname: nicknameRef.current })],
            { type: "application/json" },
          ),
        );
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, []);

  const leaveRoom = useCallback(() => {
    leaveVoice();
    if (userIdRef.current) {
      api("leave", { userId: userIdRef.current, room: ROOM, nickname: nicknameRef.current }).catch(() => {});
    }
    userIdRef.current = null;
    setUserId(null);
    setMessages([]);
    seenIds.current.clear();
    lastTsRef.current = "";
    setPhase("join");
  }, [leaveVoice]);

  // ================= UI =================

  if (phase === "join") {
    return (
      <div className="kir-root kir-grid min-h-[100dvh] flex flex-col items-center justify-center px-6 text-white">
        <div className="kir-scanline" />
        <div className="kir-orb" style={{ width: 280, height: 280, top: -70, left: -50, background: "#22d3ee", animation: "kir-aurora 14s ease-in-out infinite" }} />
        <div className="kir-orb" style={{ width: 340, height: 340, bottom: -90, right: -70, background: "#ec4899", animation: "kir-aurora2 16s ease-in-out infinite" }} />
        <div className="kir-orb" style={{ width: 240, height: 240, top: "34%", left: "52%", background: "#7c3aed", animation: "kir-aurora3 18s ease-in-out infinite" }} />

        <div className="kir-content w-full max-w-sm">
          <div className="kir-neon kir-enter rounded-[28px] p-8">
            <div className="text-center mb-7">
              <div className="relative mx-auto mb-5 w-fit">
                <div
                  className="absolute -inset-3 rounded-[26px] blur-xl opacity-70"
                  style={{ background: "conic-gradient(from 0deg,#22d3ee,#a855f7,#ec4899,#22d3ee)", animation: "kir-spin-slow 8s linear infinite" }}
                />
                <div className="relative">
                  <KiRevolutionLogo size={84} />
                </div>
              </div>
              <h1 className="kir-title text-3xl font-black uppercase">KI REVOLUTION</h1>
              <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-cyan-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 kir-dot-live" style={{ animation: "kir-blink 1.4s infinite" }} />
                Live Audio Space
              </div>
              <p className="mt-3 text-sm text-white/55">
                Nickname eingeben und verbinden. Kein Passwort, keine Anmeldung.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                join();
              }}
            >
              <input
                autoFocus
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Dein Nickname"
                maxLength={24}
                className="kir-input w-full rounded-2xl px-4 py-4 text-lg outline-none text-white placeholder:text-white/30"
              />
              <button
                type="submit"
                disabled={!nickname.trim() || joining}
                className="kir-btn mt-4 w-full rounded-2xl px-4 py-4 text-lg font-black uppercase tracking-wide text-white"
              >
                {joining ? "Verbinde…" : "▸ Verbinden"}
              </button>
            </form>
            <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40">
              Tippen für alle frei · Zuhören jederzeit · Sprechen schaltet der Admin frei
            </p>
          </div>
        </div>
      </div>
    );
  }

  const voiceUsers = users.filter((u) => u.inVoice);
  const guests = users.filter((u) => !u.isAdmin && u.id !== userId);
  const iSpeak = canSpeak || isAdmin;

  return (
    <div className="kir-root kir-grid flex flex-col h-[100dvh] text-white">
      <div ref={audioContainerRef} className="hidden" />
      <div className="kir-orb" style={{ width: 260, height: 260, top: -90, left: -70, background: "#22d3ee", animation: "kir-aurora 16s ease-in-out infinite" }} />
      <div className="kir-orb" style={{ width: 300, height: 300, bottom: -120, right: -80, background: "#ec4899", animation: "kir-aurora2 18s ease-in-out infinite" }} />

      {/* Header */}
      <header
        className="kir-content shrink-0 px-4 pt-3 pb-2.5"
        style={{ background: "rgba(9,7,24,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(150,170,255,0.14)", boxShadow: "0 12px 30px -20px rgba(124,58,237,0.8)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <KiRevolutionLogo size={32} />
            <div className="min-w-0">
              <div className="font-black uppercase tracking-wider leading-tight truncate text-sm">
                <span className="kir-title">KI REVOLUTION</span>
                {isAdmin && <span className="ml-1.5 text-fuchsia-300 text-[10px] align-middle">· ADMIN</span>}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 kir-dot-live" />
                {users.length} online · {voiceUsers.length} im Voice
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setShowAdmin((v) => !v);
                  refreshDevices();
                }}
                className="text-xs px-3 py-1.5 rounded-full text-fuchsia-100 active:scale-95 transition"
                style={{ background: "rgba(217,70,239,0.18)", border: "1px solid rgba(232,121,249,0.5)" }}
              >
                ⚙️ Admin
              </button>
            )}
            <button
              onClick={leaveRoom}
              className="kir-chip text-xs px-3 py-1.5 rounded-full text-white/70 hover:text-white active:scale-95 transition"
            >
              Verlassen
            </button>
          </div>
        </div>

        {voiceUsers.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {voiceUsers.map((u) => (
              <div
                key={u.id}
                className={`kir-chip shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                  u.speaking ? "kir-speaking text-emerald-100" : "text-white/70"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${u.speaking ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                {u.nickname}
                {u.id === userId ? " (du)" : !u.canSpeak && !u.isAdmin ? " 🎧" : ""}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Admin panel */}
      {isAdmin && showAdmin && (
        <div className="kir-content shrink-0 px-4 py-3 space-y-3 max-h-[45vh] overflow-y-auto" style={{ background: "rgba(24,10,40,0.5)", borderBottom: "1px solid rgba(232,121,249,0.22)" }}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 mb-1.5">🎚️ Audioquelle (Mikro-Eingang der KI)</div>
            <select
              value={micDeviceId}
              onChange={(e) => changeMic(e.target.value)}
              onFocus={refreshDevices}
              className="kir-input w-full text-xs rounded-xl px-3 py-2.5 outline-none text-white"
            >
              <option value="">Standard-Mikrofon</option>
              {inputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Eingang ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 mb-1.5">🔉 Audioausgang (Ton an die KI)</div>
            <select
              value={outputDeviceId}
              onChange={(e) => changeOutput(e.target.value)}
              onFocus={refreshDevices}
              className="kir-input w-full text-xs rounded-xl px-3 py-2.5 outline-none text-white"
            >
              <option value="">Standard-Ausgang</option>
              {outputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Ausgang ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-200 mb-1.5">
              🎤 Gäste fürs Sprechen freischalten ({guests.length})
            </div>
            {guests.length === 0 && <div className="text-[11px] text-white/40">Noch keine Gäste.</div>}
            <div className="space-y-1.5">
              {guests.map((g) => (
                <div key={g.id} className="kir-chip flex items-center justify-between gap-2 rounded-xl px-3 py-2">
                  <span className="text-sm truncate">
                    {g.nickname}
                    {g.inVoice && <span className="ml-1.5 text-[10px] text-emerald-300 uppercase tracking-wide">live</span>}
                  </span>
                  <button
                    onClick={() => setGuestSpeak(g.id, !g.canSpeak)}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-full font-bold text-white active:scale-95 transition"
                    style={
                      g.canSpeak
                        ? { background: "linear-gradient(110deg,#f43f5e,#e11d48)", boxShadow: "0 6px 18px -6px rgba(244,63,94,0.7)" }
                        : { background: "linear-gradient(110deg,#22d3ee,#34d399)", boxShadow: "0 6px 18px -6px rgba(52,211,153,0.7)" }
                    }
                  >
                    {g.canSpeak ? "🔇 Sperren" : "🎤 Freischalten"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">
            Windows 11: Stelle als Audioquelle das virtuelle Mikrofon der KI ein und leite den Ausgang
            an deren Eingang. So spricht und hört die KI im Kanal mit.
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="kir-content flex-1 overflow-y-auto px-3 py-4 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center text-white/40 text-sm mt-12">
            <div className="text-3xl mb-2 opacity-60">✦</div>
            Noch keine Nachrichten. Sag Hallo 👋
          </div>
        )}
        {messages.map((m) => {
          if (m.kind === "system") {
            return (
              <div key={m.id} className="text-center kir-enter">
                <span className="kir-chip text-[11px] text-cyan-100/70 rounded-full px-3 py-1 inline-block">{m.content}</span>
              </div>
            );
          }
          const mine = m.userId && m.userId === userId;
          return (
            <div key={m.id} className={`flex kir-enter ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${mine ? "text-white" : "kir-chip text-white"}`}
                style={
                  mine
                    ? { background: "linear-gradient(120deg,#0891b2,#7c3aed 60%,#c026d3)", boxShadow: "0 10px 26px -10px rgba(124,58,237,0.7)" }
                    : undefined
                }
              >
                <div className={`flex items-center gap-1.5 text-[11px] mb-0.5 ${mine ? "text-white/75" : "text-cyan-200/80"}`}>
                  {m.kind === "voice" && <span>🎤</span>}
                  <span className="font-bold uppercase tracking-wide text-[10px]">{m.nickname}</span>
                </div>
                <div className="text-[15px] leading-snug whitespace-pre-wrap break-words">{m.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control bar */}
      <div
        className="kir-content shrink-0 px-3 py-2.5 space-y-2.5"
        style={{ background: "rgba(9,7,24,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(150,170,255,0.16)", boxShadow: "0 -12px 30px -20px rgba(34,211,238,0.7)" }}
      >
        <div className="flex items-center gap-2">
          {!inVoice ? (
            <button
              onClick={joinVoice}
              className="kir-btn flex-1 rounded-2xl px-4 py-3.5 font-black uppercase tracking-wide text-white flex items-center justify-center gap-2"
            >
              {iSpeak ? "🔊 Voice beitreten" : "🎧 Live zuhören"}
            </button>
          ) : (
            <>
              {iSpeak && micActive ? (
                <button
                  onClick={toggleMute}
                  className={`flex-1 rounded-2xl px-4 py-3.5 font-black uppercase tracking-wide text-white active:scale-[0.98] transition ${speaking && !muted ? "kir-speaking" : ""}`}
                  style={
                    muted
                      ? { background: "linear-gradient(110deg,#f43f5e,#e11d48)", boxShadow: "0 8px 24px -8px rgba(244,63,94,0.7)" }
                      : speaking
                        ? { background: "linear-gradient(110deg,#22d3ee,#34d399)", boxShadow: "0 8px 26px -6px rgba(52,211,153,0.8)" }
                        : { background: "rgba(40,38,70,0.8)", border: "1px solid rgba(150,170,255,0.25)" }
                  }
                >
                  {muted ? "🔇 Stumm" : speaking ? "🎙️ Spricht…" : "🎙️ Mikro an"}
                </button>
              ) : iSpeak && !micActive ? (
                <button
                  onClick={upgradeToSpeaker}
                  className="kir-btn flex-1 rounded-2xl px-4 py-3.5 font-black uppercase tracking-wide text-white active:scale-[0.98] transition"
                >
                  🎤 Mikro aktivieren — freigeschaltet!
                </button>
              ) : (
                <div className="kir-chip flex-1 rounded-2xl px-4 py-3.5 font-semibold text-center text-sm text-white/70">
                  🔒 Nur Zuhören — frag den Admin fürs Sprechen
                </div>
              )}
              <button
                onClick={leaveVoice}
                className="rounded-2xl px-4 py-3.5 font-black uppercase tracking-wide text-white active:scale-95 transition"
                style={{ background: "linear-gradient(110deg,#f43f5e,#be123c)", boxShadow: "0 8px 24px -8px rgba(244,63,94,0.65)" }}
              >
                {iSpeak ? "Auflegen" : "Verlassen"}
              </button>
            </>
          )}
        </div>

        {/* Active speakers get a speech-to-text helper */}
        {iSpeak && inVoice && micActive && (
          <div className="flex flex-wrap gap-1.5">
            <Toggle on={sttOn} onClick={() => setSttOn((v) => !v)} label="🗣️ Sprache→Text" />
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nachricht schreiben…"
            className="kir-input flex-1 rounded-2xl px-4 py-3 outline-none text-white placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="kir-btn rounded-2xl px-5 py-3 font-black text-white text-lg"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] px-3 py-1.5 rounded-full font-semibold transition active:scale-95 text-white"
      style={
        on
          ? { background: "linear-gradient(110deg,#22d3ee,#a855f7)", boxShadow: "0 0 16px -4px rgba(168,85,247,0.7)" }
          : { background: "rgba(20,18,42,0.6)", border: "1px solid rgba(150,170,255,0.2)", color: "rgba(255,255,255,0.6)" }
      }
    >
      {label}
    </button>
  );
}
