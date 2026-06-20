"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BgMode = "white" | "dark" | "green" | "transparent";
type MicStatus = "idle" | "requesting" | "listening" | "error";

const SILENCE_THRESHOLD = 0.025;
const AUDIO_GAIN = 4.5;
const TALK_ON_VOLUME = 0.12;
const TALK_OFF_HANGOVER_MS = 350;

// Seconds into talking-loop.mp4 where the mouth is closed (verified by
// sampling mouth-region darkness across all 241 frames). Used so that when
// the mic goes quiet, playback keeps going until the next closed-mouth
// moment instead of freezing mid-word on whatever frame happens to be
// showing.
const MOUTH_CLOSED_ANCHORS_S = [0, 2.6, 4.3, 5.1, 7.6, 9.5];
const IDLE_LOOP_START_S = 9.5;
const IDLE_LOOP_END_S = 9.98;

export default function LiveAvatar() {
	const [status, setStatus] = useState<MicStatus>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [bgMode, setBgMode] = useState<BgMode>("white");
	const [controlsHidden, setControlsHidden] = useState(false);

	const videoRef = useRef<HTMLVideoElement | null>(null);
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
	const prevVideoTimeRef = useRef(0);

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
			if (video && video.readyState >= 1) {
				const t = video.currentTime;
				const wrapped = t < prevVideoTimeRef.current - 0.2;
				prevVideoTimeRef.current = t;

				if (isTalkingRef.current) {
					talkPhaseRef.current = "talking";
					if (video.paused) video.play().catch(() => {});
				} else if (talkPhaseRef.current === "talking") {
					// Mic just went quiet: don't freeze mid-word. Keep playing
					// until the next moment the mouth is naturally closed.
					talkPhaseRef.current = "closing";
					const next = MOUTH_CLOSED_ANCHORS_S.find((a) => a > t + 0.05);
					closingTargetRef.current = next ?? MOUTH_CLOSED_ANCHORS_S[0];
					if (video.paused) video.play().catch(() => {});
				} else if (talkPhaseRef.current === "closing") {
					if (video.paused) video.play().catch(() => {});
					const reachedTarget =
						closingTargetRef.current <= t ||
						(wrapped && closingTargetRef.current <= MOUTH_CLOSED_ANCHORS_S[0]);
					if (reachedTarget) {
						talkPhaseRef.current = "idle";
						video.currentTime = IDLE_LOOP_START_S;
					}
				} else {
					// idle: loop a short closed-mouth segment so she keeps
					// breathing/shifting instead of showing a frozen frame.
					if (video.paused) video.play().catch(() => {});
					if (t >= IDLE_LOOP_END_S || t < IDLE_LOOP_START_S - 0.5) {
						video.currentTime = IDLE_LOOP_START_S;
					}
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
		smoothedVolumeRef.current = 0;
		isTalkingRef.current = false;
		setStatus("idle");
	}, []);

	const startMic = useCallback(async () => {
		setStatus("requesting");
		setErrorMsg("");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
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
			setStatus("listening");
		} catch (err) {
			setStatus("error");
			setErrorMsg(
				err instanceof Error ? err.message : "Mikrofonzugriff fehlgeschlagen.",
			);
		}
	}, []);

	useEffect(() => {
		return () => {
			for (const track of streamRef.current?.getTracks() ?? []) track.stop();
			audioCtxRef.current?.close().catch(() => {});
		};
	}, []);

	const bgColor =
		bgMode === "white"
			? "#ffffff"
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
			<video
				ref={videoRef}
				muted
				loop
				playsInline
				preload="auto"
				aria-label="Animierter Sprecher-Avatar"
				poster="/avatar/poster.jpg"
				width={944}
				height={960}
				style={{
					width: "min(90vw, 480px)",
					height: "auto",
					maxHeight: "85vh",
					aspectRatio: "944 / 960",
					objectFit: "contain",
					filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
				}}
			>
				<source src="/avatar/talking-loop.mp4" type="video/mp4" />
				<source src="/avatar/talking-loop.webm" type="video/webm" />
				<track kind="captions" />
			</video>

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
