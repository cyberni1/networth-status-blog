"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BgMode = "white" | "dark" | "green" | "transparent";
type MicStatus = "idle" | "requesting" | "listening" | "error";

const SILENCE_THRESHOLD = 0.025;
const AUDIO_GAIN = 4.5;
const TALK_ON_VOLUME = 0.12;
const TALK_OFF_HANGOVER_MS = 350;

// Seconds into talking-loop.mp4 where the mouth is closed, verified frame by
// frame (not just by a darkness heuristic, which had false positives where
// teeth/open mouth read as "dark" too). The footage has two long stretches
// (~0.8s-3.8s and ~6.6s-9.8s) of continuous talking with no closed-mouth
// frame at all, so gaps here can't be fully eliminated - see
// MAX_CLOSE_WAIT_MS below for the bound on how long we wait regardless.
const MOUTH_CLOSED_ANCHORS_S = [0, 0.83, 3.79, 4.3, 4.83, 6.17, 6.58, 9.83];

// Once playback reaches a closed-mouth anchor, keep playing this much longer
// before cutting to idle. Stopping exactly on the anchor frame reads as an
// abrupt freeze; a short settle lets the closing motion finish naturally.
const CLOSE_SETTLE_MS = 180;

// Hard cap on how long we wait for a closed-mouth anchor after the mic goes
// quiet. The source footage has multi-second stretches with no closed-mouth
// frame, so waiting for a "perfect" anchor can take seconds and reads as the
// avatar talking long after the person stopped. If no anchor is reached in
// time, crossfade to idle anyway - the opacity transition hides the cut.
const MAX_CLOSE_WAIT_MS = 600;

// talking-loop.mp4 only has a single keyframe (at t=0), so seeking into it
// repeatedly (as the old idle implementation did every ~0.5s) forces a full
// decode from frame 0 each time and causes visible stutter. Idle motion is
// therefore handled by a separate, short, natively-looping clip instead.
const CROSSFADE_MS = 220;

export default function LiveAvatar() {
	const [status, setStatus] = useState<MicStatus>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [bgMode, setBgMode] = useState<BgMode>("white");
	const [controlsHidden, setControlsHidden] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState("");
	const [rawAudio, setRawAudio] = useState(false);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const idleVideoRef = useRef<HTMLVideoElement | null>(null);
	const meterRef = useRef<HTMLDivElement | null>(null);

	const rafRef = useRef<number | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const smoothedVolumeRef = useRef(0);
	const lastLoudAtRef = useRef(0);
	const isTalkingRef = useRef(false);
	const talkPhaseRef = useRef<"talking" | "closing" | "idle">("idle");
	const closingTargetRef = useRef(0);
	const closingReachedAtRef = useRef<number | null>(null);
	const closingStartedAtRef = useRef(0);
	const prevVideoTimeRef = useRef(0);
	// Set once on the first successful start, never reset on stop — once the
	// avatar has been started, it should keep its idle motion (mouth closes
	// naturally, idle loop keeps playing) even after the mic is stopped.
	// Only before the very first start should it sit on the static poster.
	const hasStartedRef = useRef(false);

	useEffect(() => {
		const refreshDevices = async () => {
			try {
				const devices = await navigator.mediaDevices.enumerateDevices();
				setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
			} catch {
				// Device enumeration can fail before permission is granted in
				// some browsers; the dropdown just stays empty until then.
			}
		};
		refreshDevices();
		navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
		return () =>
			navigator.mediaDevices.removeEventListener(
				"devicechange",
				refreshDevices,
			);
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const bg = params.get("bg");
		if (
			bg === "green" ||
			bg === "transparent" ||
			bg === "dark" ||
			bg === "white"
		)
			setBgMode(bg);
		if (params.get("hideControls") === "1") setControlsHidden(true);
	}, []);

	useEffect(() => {
		const loop = (timeMs: number) => {
			if (!hasStartedRef.current) {
				// Avatar hasn't been started yet: stay on the static poster
				// frame instead of auto-playing any loop.
				const idleVideo = idleVideoRef.current;
				if (idleVideo && !idleVideo.paused) {
					idleVideo.pause();
					idleVideo.currentTime = 0;
				}
				const video = videoRef.current;
				if (video && !video.paused) video.pause();
				rafRef.current = requestAnimationFrame(loop);
				return;
			}

			let rms = 0;
			const analyser = analyserRef.current;
			const dataArray = dataArrayRef.current;
			if (analyser && dataArray) {
				analyser.getByteTimeDomainData(dataArray);
				let sum = 0;
				for (let i = 0; i < dataArray.length; i++) {
					const v = (dataArray[i] - 128) / 128;
					sum += v * v;
				}
				rms = Math.sqrt(sum / dataArray.length);
			}

			const target =
				rms > SILENCE_THRESHOLD
					? Math.min(1, (rms - SILENCE_THRESHOLD) * AUDIO_GAIN)
					: 0;
			const smoothing = target > smoothedVolumeRef.current ? 0.6 : 0.18;
			smoothedVolumeRef.current +=
				(target - smoothedVolumeRef.current) * smoothing;
			const vol = smoothedVolumeRef.current;

			if (vol > TALK_ON_VOLUME) lastLoudAtRef.current = timeMs;
			isTalkingRef.current =
				timeMs - lastLoudAtRef.current < TALK_OFF_HANGOVER_MS;

			const video = videoRef.current;
			const idleVideo = idleVideoRef.current;
			if (video && video.readyState >= 1) {
				const t = video.currentTime;
				const wrapped = t < prevVideoTimeRef.current - 0.2;
				prevVideoTimeRef.current = t;

				if (isTalkingRef.current) {
					if (talkPhaseRef.current !== "talking") {
						// Coming from idle: the talk clip only has one keyframe
						// (t=0), so restarting there is instant and seek-free.
						if (talkPhaseRef.current === "idle") video.currentTime = 0;
						talkPhaseRef.current = "talking";
						closingReachedAtRef.current = null;
						video.style.opacity = "1";
						if (idleVideo) idleVideo.style.opacity = "0";
					}
					if (video.paused) video.play().catch(() => {});
				} else if (talkPhaseRef.current === "talking") {
					// Mic just went quiet: don't freeze mid-word. Keep playing
					// until the next moment the mouth is naturally closed.
					talkPhaseRef.current = "closing";
					closingReachedAtRef.current = null;
					closingStartedAtRef.current = timeMs;
					const next = MOUTH_CLOSED_ANCHORS_S.find((a) => a > t + 0.05);
					closingTargetRef.current = next ?? MOUTH_CLOSED_ANCHORS_S[0];
					if (video.paused) video.play().catch(() => {});
				} else if (talkPhaseRef.current === "closing") {
					if (video.paused) video.play().catch(() => {});
					const reachedTarget =
						closingTargetRef.current <= t ||
						(wrapped && closingTargetRef.current <= MOUTH_CLOSED_ANCHORS_S[0]);
					const timedOut =
						timeMs - closingStartedAtRef.current >= MAX_CLOSE_WAIT_MS;
					if (
						(reachedTarget || timedOut) &&
						closingReachedAtRef.current === null
					) {
						closingReachedAtRef.current = timeMs;
					}
					// Keep playing a little past the closed-mouth anchor instead
					// of cutting on the exact frame, so the closing motion reads
					// as finishing naturally rather than freezing abruptly. Skip
					// the extra settle once we've already timed out waiting.
					if (
						closingReachedAtRef.current !== null &&
						(timedOut ||
							timeMs - closingReachedAtRef.current >= CLOSE_SETTLE_MS)
					) {
						closingReachedAtRef.current = null;
						talkPhaseRef.current = "idle";
						// The idle clip loops natively (no JS seeking needed),
						// which avoids the keyframe-decode stutter entirely.
						if (idleVideo) {
							if (idleVideo.paused) idleVideo.play().catch(() => {});
							idleVideo.style.opacity = "1";
						}
						video.style.opacity = "0";
						video.pause();
					}
				} else if (idleVideo?.paused) {
					// Mic just started: kick off the idle loop.
					idleVideo.play().catch(() => {});
				}
			}

			if (meterRef.current) {
				meterRef.current.style.width = `${Math.round(vol * 100)}%`;
			}

			rafRef.current = requestAnimationFrame(loop);
		};

		rafRef.current = requestAnimationFrame(loop);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const stopMic = useCallback(() => {
		for (const track of streamRef.current?.getTracks() ?? []) track.stop();
		streamRef.current = null;
		audioCtxRef.current?.close().catch(() => {});
		audioCtxRef.current = null;
		analyserRef.current = null;
		dataArrayRef.current = null;
		// Don't touch talkPhaseRef/hasStartedRef here: the rAF loop will see
		// silence (no analyser) and let the mouth close naturally, then keep
		// the idle loop running, instead of freezing mid-word.
		setStatus("idle");
	}, []);

	const startMic = useCallback(async () => {
		setStatus("requesting");
		setErrorMsg("");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
					// Echo cancellation/noise suppression/AGC are tuned for a
					// real microphone picking up a human voice in a room. Fed
					// with a virtual-cable loopback (e.g. VB-Audio Cable
					// carrying a TTS voice), Chrome's echo canceller can
					// recognize the signal as an echo of audio already
					// playing on the same machine and suppress it almost
					// entirely - the avatar then never sees enough volume to
					// "talk". The raw-audio toggle disables all three for
					// exactly that case.
					echoCancellation: !rawAudio,
					noiseSuppression: !rawAudio,
					autoGainControl: !rawAudio,
				},
			});
			const audioCtx = new AudioContext();
			const source = audioCtx.createMediaStreamSource(stream);
			const analyser = audioCtx.createAnalyser();
			analyser.fftSize = 1024;
			source.connect(analyser);

			streamRef.current = stream;
			audioCtxRef.current = audioCtx;
			analyserRef.current = analyser;
			dataArrayRef.current = new Uint8Array(analyser.fftSize);
			hasStartedRef.current = true;
			setHasStarted(true);
			setStatus("listening");

			// Device labels are only populated once permission is granted, so
			// refresh the list now to show real names instead of blank ones.
			const devices = await navigator.mediaDevices.enumerateDevices();
			setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
		} catch (err) {
			setStatus("error");
			setErrorMsg(
				err instanceof Error ? err.message : "Mikrofonzugriff fehlgeschlagen.",
			);
		}
	}, [selectedDeviceId, rawAudio]);

	useEffect(() => {
		return () => {
			for (const track of streamRef.current?.getTracks() ?? []) track.stop();
			audioCtxRef.current?.close().catch(() => {});
		};
	}, []);

	const bgColor =
		bgMode === "white"
			? "#fcfcfc"
			: bgMode === "dark"
				? "#080810"
				: bgMode === "green"
					? "#00ff00"
					: "transparent";

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: bgColor,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
			}}
		>
			<style>{`
				@keyframes avatarIdleSway {
					0%, 100% { transform: rotate(0deg) translate(0, 0); }
					25% { transform: rotate(0.6deg) translate(1px, -1px); }
					50% { transform: rotate(0deg) translate(0, -2px); }
					75% { transform: rotate(-0.5deg) translate(-1px, -1px); }
				}
			`}</style>
			<div
				style={{
					position: "relative",
					width: "min(90vw, 480px)",
					maxHeight: "85vh",
					aspectRatio: "944 / 960",
					transformOrigin: "50% 100%",
					animation: hasStarted
						? "avatarIdleSway 6s ease-in-out infinite"
						: "none",
				}}
			>
				<video
					ref={idleVideoRef}
					muted
					loop
					playsInline
					preload="auto"
					tabIndex={-1}
					poster="/avatar/poster.jpg"
					width={944}
					height={960}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "contain",
						opacity: 1,
						transition: `opacity ${CROSSFADE_MS}ms ease`,
					}}
				>
					<source src="/avatar/idle-loop.mp4" type="video/mp4" />
					<source src="/avatar/idle-loop.webm" type="video/webm" />
				</video>
				<video
					ref={videoRef}
					muted
					playsInline
					preload="auto"
					aria-label="Animierter Sprecher-Avatar"
					poster="/avatar/poster.jpg"
					width={944}
					height={960}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "contain",
						opacity: 0,
						transition: `opacity ${CROSSFADE_MS}ms ease`,
					}}
				>
					<source src="/avatar/talking-loop.mp4" type="video/mp4" />
					<source src="/avatar/talking-loop.webm" type="video/webm" />
					<track kind="captions" />
				</video>
			</div>

			{!controlsHidden && (
				<div
					style={{
						position: "fixed",
						bottom: "24px",
						left: "50%",
						transform: "translateX(-50%)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "12px",
						background: "rgba(8,8,16,0.7)",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "16px",
						padding: "16px 20px",
						backdropFilter: "blur(8px)",
						maxWidth: "92vw",
					}}
				>
					<div
						style={{
							display: "flex",
							gap: "10px",
							flexWrap: "wrap",
							justifyContent: "center",
						}}
					>
						{status === "listening" ? (
							<button
								type="button"
								onClick={stopMic}
								style={btnStyle("#ef4444")}
							>
								⏹ Mikrofon stoppen
							</button>
						) : (
							<button
								type="button"
								onClick={startMic}
								disabled={status === "requesting"}
								style={btnStyle("#10b981")}
							>
								{status === "requesting" ? "Verbinde…" : "🎙 Avatar starten"}
							</button>
						)}
						{(["white", "dark", "green", "transparent"] as BgMode[]).map(
							(mode) => (
								<button
									key={mode}
									type="button"
									onClick={() => setBgMode(mode)}
									style={btnStyle(
										bgMode === mode ? "#a855f7" : "rgba(255,255,255,0.1)",
									)}
								>
									{mode === "white"
										? "Weiß"
										: mode === "dark"
											? "Dunkel"
											: mode === "green"
												? "Greenscreen"
												: "Transparent"}
								</button>
							),
						)}
						<button
							type="button"
							onClick={() => setControlsHidden(true)}
							style={btnStyle("rgba(255,255,255,0.1)")}
						>
							Steuerung ausblenden
						</button>
					</div>

					<select
						value={selectedDeviceId}
						onChange={(e) => setSelectedDeviceId(e.target.value)}
						disabled={status === "listening" || status === "requesting"}
						style={{
							width: "100%",
							maxWidth: "320px",
							padding: "8px 10px",
							borderRadius: "8px",
							border: "1px solid rgba(255,255,255,0.15)",
							background: "rgba(255,255,255,0.08)",
							color: "#fff",
							fontSize: "12px",
						}}
					>
						<option value="" style={{ color: "#000" }}>
							Standardmikrofon
						</option>
						{audioDevices.map((d, i) => (
							<option
								key={d.deviceId}
								value={d.deviceId}
								style={{ color: "#000" }}
							>
								{d.label || `Mikrofon ${i + 1}`}
							</option>
						))}
					</select>

					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							color: "rgba(255,255,255,0.7)",
							fontSize: "11px",
							opacity:
								status === "listening" || status === "requesting" ? 0.4 : 1,
							cursor:
								status === "listening" || status === "requesting"
									? "not-allowed"
									: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={rawAudio}
							onChange={(e) => setRawAudio(e.target.checked)}
							disabled={status === "listening" || status === "requesting"}
						/>
						Rohsignal (für virtuelles Audiokabel, z. B. VB-Cable)
						{(status === "listening" || status === "requesting") && (
							<span style={{ fontStyle: "italic" }}>
								— zum Ändern erst Mikrofon stoppen
							</span>
						)}
					</label>

					<div
						style={{
							width: "220px",
							height: "6px",
							borderRadius: "100px",
							background: "rgba(255,255,255,0.1)",
							overflow: "hidden",
						}}
					>
						<div
							ref={meterRef}
							style={{
								height: "100%",
								width: "0%",
								background: "linear-gradient(90deg,#10b981,#f5c842)",
							}}
						/>
					</div>

					{status === "error" && (
						<p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>
							{errorMsg}
						</p>
					)}
					{status === "idle" && (
						<p
							style={{
								color: "rgba(255,255,255,0.4)",
								fontSize: "12px",
								margin: 0,
								textAlign: "center",
							}}
						>
							Mikrofon starten, damit das Video bei Stimme abspielt. Für OBS:
							Browser-Quelle auf diese Seite zeigen lassen (z. B. mit
							?bg=green&hideControls=1).
						</p>
					)}
				</div>
			)}

			{controlsHidden && (
				<button
					type="button"
					onClick={() => setControlsHidden(false)}
					style={{
						position: "fixed",
						bottom: "16px",
						right: "16px",
						...btnStyle("rgba(255,255,255,0.15)"),
						opacity: 0.5,
					}}
				>
					⚙
				</button>
			)}
		</div>
	);
}

function btnStyle(bg: string): React.CSSProperties {
	return {
		padding: "10px 16px",
		borderRadius: "10px",
		border: "none",
		background: bg,
		color: "#fff",
		fontSize: "13px",
		fontWeight: 700,
		cursor: "pointer",
		whiteSpace: "nowrap",
	};
}
