import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// MediaRecorder utilities
export type MediaRecorderController = {
	start: (timesliceMs?: number) => void;
	stop: () => Promise<string | null>;
	getUrl: () => string | null;
	cleanup: () => void;
	mimeType: string | null;
	isSupported: boolean;
};

export function pickSupportedRecordingMime(): string | null {
	if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
		return null;
	}
	const candidates = [
		"video/webm;codecs=vp8,opus",
		"video/webm;codecs=vp9,opus",
		"video/webm",
		"video/mp4;codecs=h264,aac", // may be unsupported in many browsers
	];
	for (const type of candidates) {
		try {
			if ((MediaRecorder as any).isTypeSupported?.(type)) return type;
		} catch {}
	}
	return null;
}

export function createMediaRecorderController(
	stream: MediaStream
): MediaRecorderController {
	let recorder: MediaRecorder | null = null;
	let chunks: Blob[] = [];
	let url: string | null = null;

	const mimeType = pickSupportedRecordingMime();
	const isSupported = typeof MediaRecorder !== "undefined" && !!mimeType;

	if (isSupported) {
		recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
		recorder.ondataavailable = (e: BlobEvent) => {
			if (e.data && e.data.size > 0) chunks.push(e.data);
		};
	}

	const start = (timesliceMs: number = 1000) => {
		if (!recorder || recorder.state !== "inactive") return;
		chunks = [];
		recorder.start(timesliceMs);
	};

	const stop = () =>
		new Promise<string | null>((resolve) => {
			if (!recorder || recorder.state === "inactive") {
				resolve(url);
				return;
			}
			const onStop = () => {
				const blob = new Blob(chunks, { type: mimeType || "video/webm" });
				if (url) URL.revokeObjectURL(url);
				url = URL.createObjectURL(blob);
				resolve(url);
			};
			recorder.onstop = onStop;
			recorder.stop();
		});

	const getUrl = () => url;

	const cleanup = () => {
		if (url) {
			URL.revokeObjectURL(url);
			url = null;
		}
		chunks = [];
	};

	return { start, stop, getUrl, cleanup, mimeType, isSupported };
}
