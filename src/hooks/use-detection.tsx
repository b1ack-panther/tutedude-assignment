import { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import * as faceLandmarks from "@tensorflow-models/face-landmarks-detection";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

interface DetectionResult {
	facesDetected: number;
	isLookingAway: boolean;
	objects: string[];
	lastDetectionTime: number;
	isModelsLoading: boolean;
}

export function useDetection(
	videoRef: React.RefObject<HTMLVideoElement>,
	isActive: boolean
) {
	const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
	const landmarksModelRef = useRef<faceLandmarks.FaceLandmarksDetector | null>(
		null
	);
	const objectModelRef = useRef<cocoSsd.ObjectDetection | null>(null);

	const [result, setResult] = useState<DetectionResult>({
		facesDetected: 0,
		isLookingAway: false,
		objects: [],
		lastDetectionTime: 0,
		isModelsLoading: true,
	});

	// load models once
	useEffect(() => {
		const loadModels = async () => {
			try {
				await tf.ready();
				try {
					await tf.setBackend("webgl");
				} catch {
					await tf.setBackend("cpu");
				}

				faceModelRef.current = await blazeface.load();

				landmarksModelRef.current = await faceLandmarks.createDetector(
					faceLandmarks.SupportedModels.MediaPipeFaceMesh,
					{
						runtime: "mediapipe",
						solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
						refineLandmarks: true,
					}
				);

				objectModelRef.current = await cocoSsd.load();
			} catch (err: any) {
				console.error("Model loading failed:", err.message);
			} finally {
				setResult((prev) => ({ ...prev, isModelsLoading: false }));
			}
		};

		loadModels();
	}, []);

	// detection loop with setInterval
	useEffect(() => {
		if (!isActive) return;
		if (result.isModelsLoading) return;
		if (!faceModelRef.current) return;

		const intervalId = setInterval(async () => {
			const videoEl = videoRef.current;
			if (
				!videoEl ||
				!(videoEl instanceof HTMLVideoElement) ||
				videoEl.readyState < 2 ||
				videoEl.videoWidth === 0 ||
				videoEl.videoHeight === 0
			) {
				return;
			}

			try {
				// face detection
				const faces = await faceModelRef.current?.estimateFaces(videoEl, false);
				const facesCount =
					faces.filter((face) => face.probability[0] > 0.8)?.length || 0;
				// looking away detection
				let lookingAway = false;
				if (facesCount === 1 && landmarksModelRef.current) {
					try {
						const preds = await landmarksModelRef.current.estimateFaces(
							videoEl
						);
						if (preds.length > 0) {
							const keypoints = preds[0].keypoints || [];
							const leftEye = keypoints.find((k: any) => k.name === "leftEye");
							const rightEye = keypoints.find(
								(k: any) => k.name === "rightEye"
							);
							// fallback: pick a middle keypoint if no noseTip
							const nose =
								keypoints.find((k: any) => k.name === "noseTip") ||
								keypoints[1];

							if (nose && leftEye && rightEye) {
								const faceCenterX = (leftEye.x + rightEye.x) / 2;
								const dx = nose.x - faceCenterX;
								const normalized = dx / (rightEye.x - leftEye.x);
								if (Math.abs(normalized) > 0.6) {
									lookingAway = true;
								}
							}
						}
					} catch (err) {
						console.warn("Landmark detection skipped:", err);
					}
				}

				// object detection (less frequent)
				let objects: string[] = [];
				if (objectModelRef.current && Math.random() < 0.2) {
					try {
						const dets = await objectModelRef.current.detect(videoEl);
						const interesting = ["cell phone", "book", "laptop", "tablet"];
						objects = dets
							.filter((d) => interesting.includes(d.class))
							.map((d) => d.class);
					} catch (err) {
						console.warn("Object detection skipped:", err);
					}
				}

				setResult((prev) => ({
					...prev,
					facesDetected: facesCount,
					isLookingAway: lookingAway,
					objects,
					lastDetectionTime: Date.now(),
				}));
			} catch (err: any) {
				console.error("Detection failed:", err.message);
			}
		}, 500); // runs every 100ms (~10fps)

		return () => clearInterval(intervalId);
	}, [isActive, videoRef, result.isModelsLoading]);

	return result;
}
