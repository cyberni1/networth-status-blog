"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BgMode = "dark" | "green" | "transparent";
type MicStatus = "idle" | "requesting" | "listening" | "error";

const SILENCE_THRESHOLD = 0.04;
const AUDIO_GAIN = 3.2;
const HAIR_STRANDS = [0, 1];

export default function LiveAvatar() {
	const [status, setStatus] = useState<MicStatus>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [bgMode, setBgMode] = useState<BgMode>("dark");
	const [controlsHidden, setControlsHidden] = useState(false);

	const headRef = useRef<SVGGElement | null>(null);
	const hairBackRef = useRef<SVGEllipseElement | null>(null);
	const hairStrandRefs = useRef<(SVGGElement | null)[]>([]);
	const shoulderRef = useRef<SVGGElement | null>(null);
	const eyesRef = useRef<SVGGElement | null>(null);
	const mouthRef = useRef<SVGEllipseElement | null>(null);
	const accentLightsRef = useRef<SVGGElement | null>(null);
	const meterRef = useRef<HTMLDivElement | null>(null);

	const rafRef = useRef<number | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const smoothedVolumeRef = useRef(0);
	const isBlinkingRef = useRef(false);
	const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const bg = params.get("bg");
		if (bg === "green" || bg === "transparent" || bg === "dark") setBgMode(bg);
		if (params.get("hideControls") === "1") setControlsHidden(true);
	}, []);

	useEffect(() => {
		let cancelled = false;
		const scheduleBlink = () => {
			const delay = 2200 + Math.random() * 3200;
			blinkTimeoutRef.current = setTimeout(() => {
				if (cancelled) return;
				isBlinkingRef.current = true;
				setTimeout(() => {
					isBlinkingRef.current = false;
				}, 130);
				scheduleBlink();
			}, delay);
		};
		scheduleBlink();
		return () => {
			cancelled = true;
			if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
		};
	}, []);

	useEffect(() => {
		const loop = (timeMs: number) => {
			const t = timeMs / 1000;

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
			const smoothing = target > smoothedVolumeRef.current ? 0.45 : 0.15;
			smoothedVolumeRef.current +=
				(target - smoothedVolumeRef.current) * smoothing;
			const vol = smoothedVolumeRef.current;

			const flap = vol > 0.03 ? 0.55 + 0.45 * Math.sin(t * 16) : 0;
			const mouthOpen = Math.max(0, vol * flap);
			if (mouthRef.current) {
				mouthRef.current.style.transform = `scaleY(${0.18 + mouthOpen * 1.6})`;
			}

			const talkBoost = vol * 3.5;
			const headRotate = Math.sin(t * 0.55) * 2.2 + talkBoost * 0.5;
			const headX = Math.sin(t * 0.33 + 1) * 2;
			const headY = Math.sin(t * 0.8) * 3 - talkBoost * 0.4;
			if (headRef.current) {
				headRef.current.style.transform = `translate(${headX}px, ${headY}px) rotate(${headRotate}deg)`;
			}

			const shoulderY = Math.sin(t * 0.45) * 2.6;
			if (shoulderRef.current) {
				shoulderRef.current.style.transform = `translateY(${shoulderY}px)`;
			}

			if (hairBackRef.current) {
				const swayBack = Math.sin(t * 0.4 + 2) * 1.6 + talkBoost * 0.3;
				hairBackRef.current.style.transform = `rotate(${swayBack}deg)`;
			}

			for (const [i, el] of hairStrandRefs.current.entries()) {
				if (!el) continue;
				const phase = i * 0.8;
				const amp = 3 + i * 0.7;
				const sway =
					Math.sin(t * 0.9 + phase) * amp + vol * Math.sin(t * 11 + phase) * 4;
				el.style.transform = `rotate(${sway}deg)`;
			}

			if (eyesRef.current) {
				eyesRef.current.style.transform = isBlinkingRef.current
					? "scaleY(0.08)"
					: "scaleY(1)";
			}

			if (accentLightsRef.current) {
				const pulse = 0.55 + 0.15 * Math.sin(t * 1.2) + vol * 0.4;
				accentLightsRef.current.style.opacity = `${Math.min(1, pulse)}`;
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
		bgMode === "dark"
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
			<svg
				viewBox="0 0 400 520"
				width="min(90vw, 480px)"
				style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))" }}
				role="img"
				aria-label="Animierter Sprecher-Avatar"
			>
				<title>Animierter Sprecher-Avatar</title>

				<defs>
					<filter id="blueGlow" x="-150%" y="-150%" width="400%" height="400%">
						<feGaussianBlur stdDeviation="3.2" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<ellipse
					ref={hairBackRef}
					cx="200"
					cy="195"
					rx="115"
					ry="118"
					fill="#cdd2da"
					style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
				/>

				<g
					ref={shoulderRef}
					style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
				>
					{/* white plated body */}
					<path
						d="M70,520 L70,445 Q70,375 150,365 L250,365 Q330,375 330,445 L330,520 Z"
						fill="#f0f2f5"
						stroke="#c7ccd3"
						strokeWidth="2"
					/>
					<path
						d="M70,470 L70,445 Q70,375 150,365 L160,365 L95,470 Z"
						fill="#ffffff"
						opacity="0.5"
					/>

					{/* dark mechanical collar */}
					<path
						d="M152,366 L184,332 L200,348 L216,332 L248,366 L234,398 L166,398 Z"
						fill="#2c2f36"
						stroke="#1a1c21"
						strokeWidth="1.5"
					/>
					<rect x="178" y="322" width="44" height="62" rx="10" fill="#2c2f36" />

					{/* crossed mechanical arms */}
					<g>
						<circle
							cx="292"
							cy="408"
							r="15"
							fill="#dfe2e6"
							stroke="#9aa1ab"
							strokeWidth="2"
						/>
						<rect
							x="165"
							y="403"
							width="120"
							height="38"
							rx="19"
							fill="#e4e7eb"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(22 225 422)"
						/>
						<circle
							cx="190"
							cy="433"
							r="9"
							fill="#2c2f36"
							transform="rotate(22 225 422)"
						/>
						<ellipse
							cx="163"
							cy="443"
							rx="27"
							ry="19"
							fill="#f8f9fa"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(22 225 422)"
						/>
						<line
							x1="150"
							y1="436"
							x2="176"
							y2="436"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(22 225 422)"
						/>
						<line
							x1="150"
							y1="450"
							x2="176"
							y2="450"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(22 225 422)"
						/>

						<circle
							cx="108"
							cy="412"
							r="15"
							fill="#dfe2e6"
							stroke="#9aa1ab"
							strokeWidth="2"
						/>
						<rect
							x="115"
							y="406"
							width="120"
							height="38"
							rx="19"
							fill="#eef0f3"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(-22 175 425)"
						/>
						<circle
							cx="210"
							cy="436"
							r="9"
							fill="#2c2f36"
							transform="rotate(-22 175 425)"
						/>
						<ellipse
							cx="237"
							cy="446"
							rx="27"
							ry="19"
							fill="#fbfcfd"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(-22 175 425)"
						/>
						<line
							x1="224"
							y1="439"
							x2="250"
							y2="439"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(-22 175 425)"
						/>
						<line
							x1="224"
							y1="453"
							x2="250"
							y2="453"
							stroke="#9aa1ab"
							strokeWidth="2"
							transform="rotate(-22 175 425)"
						/>
					</g>

					<g ref={accentLightsRef} filter="url(#blueGlow)">
						<rect x="180" y="386" width="11" height="6" rx="3" fill="#3ecbff" />
						<rect
							x="194.5"
							y="389"
							width="11"
							height="6"
							rx="3"
							fill="#3ecbff"
						/>
						<rect x="209" y="386" width="11" height="6" rx="3" fill="#3ecbff" />
						<circle cx="95" cy="420" r="5" fill="#3ecbff" />
						<circle cx="305" cy="420" r="5" fill="#3ecbff" />
					</g>
				</g>

				<g
					ref={headRef}
					style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
				>
					<ellipse cx="200" cy="235" rx="92" ry="105" fill="#f6ddc9" />

					{HAIR_STRANDS.map((i) => {
						const side = i === 0 ? -1 : 1;
						const cx = 200 + side * 100;
						return (
							<g
								key={i}
								ref={(el) => {
									hairStrandRefs.current[i] = el;
								}}
								style={{
									transformBox: "fill-box",
									transformOrigin: `${cx}px 165px`,
								}}
							>
								<path
									d={`M${cx},165 Q${cx + side * 18},210 ${cx + side * 6},245`}
									stroke="#cdd2da"
									strokeWidth="9"
									strokeLinecap="round"
									fill="none"
								/>
							</g>
						);
					})}

					<ellipse cx="200" cy="118" rx="56" ry="42" fill="#d7dbe1" />
					<ellipse cx="200" cy="96" rx="34" ry="26" fill="#c3c8d0" />

					<path
						d="M148,205 Q165,192 182,203"
						stroke="#aab0b8"
						strokeWidth="5"
						strokeLinecap="round"
						fill="none"
					/>
					<path
						d="M218,203 Q235,192 252,205"
						stroke="#aab0b8"
						strokeWidth="5"
						strokeLinecap="round"
						fill="none"
					/>

					<g
						ref={eyesRef}
						style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
					>
						<ellipse cx="165" cy="230" rx="13" ry="15" fill="#fff" />
						<ellipse cx="235" cy="230" rx="13" ry="15" fill="#fff" />
						<circle cx="167" cy="232" r="6.5" fill="#4a90d9" />
						<circle cx="237" cy="232" r="6.5" fill="#4a90d9" />
						<circle cx="167" cy="232" r="2.5" fill="#162636" />
						<circle cx="237" cy="232" r="2.5" fill="#162636" />
					</g>

					<ellipse
						ref={mouthRef}
						cx="200"
						cy="282"
						rx="24"
						ry="7"
						fill="#c98f8f"
						style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
					/>
				</g>
			</svg>

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
						{(["dark", "green", "transparent"] as BgMode[]).map((mode) => (
							<button
								key={mode}
								type="button"
								onClick={() => setBgMode(mode)}
								style={btnStyle(
									bgMode === mode ? "#a855f7" : "rgba(255,255,255,0.1)",
								)}
							>
								{mode === "dark"
									? "Dunkel"
									: mode === "green"
										? "Greenscreen"
										: "Transparent"}
							</button>
						))}
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
							Mikrofon starten, damit der Avatar mitspricht. Für OBS:
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
