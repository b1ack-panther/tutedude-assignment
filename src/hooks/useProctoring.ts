import { useState, useRef, useCallback } from "react";
import {
	DetectionConfig,
	DetectionEvent,
	ProctoringSession,
	VideoStats,
	EventType,
	Severity,
	FocusType,
} from "@/types/proctoring";

export const useProctoring = (candidateName: string) => {
	const [session, setSession] = useState<ProctoringSession>({
		candidateName,
		sessionId: `session_${Date.now()}`,
		startTime: new Date(),
		events: [],
		integrityScore: 100,
	});

	const [videoStats, setVideoStats] = useState<VideoStats>({
		isVideoActive: false,
		facesDetected: 0,
		lastFaceDetection: null,
		focusLostDuration: 0,
		currentFocusState: FocusType.FOCUSED,
	});

	const [isRecording, setIsRecording] = useState(false);

	const focusLostStart = useRef<Date | null>(null);
	const noFaceStart = useRef<Date | null>(null);

	const addEvent = useCallback(
		(
			type: DetectionEvent["type"],
			severity: DetectionEvent["severity"],
			description: string,
			duration?: number
		) => {
			const event: DetectionEvent = {
				id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
				type,
				timestamp: new Date(),
				duration,
				severity,
				description,
			};

			setSession((prev) => {
				const newEvents = [...prev.events, event];
				const scoreDeduction =
					severity === Severity.HIGH
						? 10
						: severity === Severity.MEDIUM
						? 5
						: 2;
				const newScore = Math.max(0, prev.integrityScore - scoreDeduction);

				return {
					...prev,
					events: newEvents,
					integrityScore: newScore,
				};
			});
			return event;
		},
		[]
	);

	const handleFocusLost = useCallback(() => {
		if (!focusLostStart.current) {
			focusLostStart.current = new Date();
		}

		setVideoStats((prev) => ({
			...prev,
			currentFocusState: FocusType.LOOKING_AWAY,
		}));
	}, []);

	const handleFocusRegained = useCallback(() => {
		if (focusLostStart.current) {
			const duration = (Date.now() - focusLostStart.current.getTime()) / 1000;

			if (duration > DetectionConfig.focusThreshold) {
				addEvent(
					EventType.FOCUS_LOST,
					duration > 15
						? Severity.HIGH
						: duration > 10
						? Severity.MEDIUM
						: Severity.LOW,
					`Focus lost for ${duration.toFixed(1)} seconds`,
					duration
				);
			}

			focusLostStart.current = null;
			setVideoStats((prev) => ({
				...prev,
				currentFocusState: FocusType.FOCUSED,
				focusLostDuration: prev.focusLostDuration + duration,
			}));
		}
	}, [addEvent]);

	const handleNoFace = useCallback(() => {
		if (!noFaceStart.current) {
			noFaceStart.current = new Date();
		}

		setVideoStats((prev) => ({
			...prev,
			currentFocusState: FocusType.NO_FACE,
			facesDetected: 0,
		}));
	}, []);

	const handleFaceDetected = useCallback(
		(faceCount: number) => {
			const now = new Date();

			if (noFaceStart.current) {
				const duration = (now.getTime() - noFaceStart.current.getTime()) / 1000;

				if (duration > DetectionConfig.faceAbsenceThreshold) {
					addEvent(
						EventType.NO_FACE,
						duration > 30 ? Severity.HIGH : Severity.MEDIUM,
						`No face detected for ${duration.toFixed(1)} seconds`,
						duration
					);
				}

				noFaceStart.current = null;
			}

			if (faceCount > 1) {
				addEvent(
					EventType.MULTIPLE_FACES,
					Severity.HIGH,
					`Multiple faces detected (${faceCount} faces)`
				);
			}

			setVideoStats((prev) => ({
				...prev,
				facesDetected: faceCount,
				lastFaceDetection: now,
				currentFocusState: FocusType.FOCUSED,
			}));

			// If focus was lost, regain it
			if (focusLostStart.current) {
				handleFocusRegained();
			}
		},
		[addEvent, handleFocusRegained]
	);

	const handleObjectDetected = useCallback(
		(objectType: string) => {
			const eventType = objectType.includes("phone")
				? EventType.PHONE_DETECTED
				: objectType.includes("book") || objectType.includes("paper")
				? EventType.BOOK_DETECTED
				: EventType.OTHER;

			addEvent(
				eventType,
				Severity.HIGH,
				`Suspicious object detected: ${objectType}`
			);
		},
		[addEvent]
	);

	const startSession = useCallback(() => {
		setIsRecording(true);
		setVideoStats((prev) => ({ ...prev, isVideoActive: true }));
	}, []);

	const endSession = useCallback(() => {
		// Flush any ongoing focus lost segment
		if (focusLostStart.current) {
			handleFocusRegained();
		}

		// Flush any ongoing no-face segment
		if (noFaceStart.current) {
			const duration = (Date.now() - noFaceStart.current.getTime()) / 1000;
			if (duration > DetectionConfig.faceAbsenceThreshold) {
				addEvent(
					EventType.NO_FACE,
					duration > 30 ? Severity.HIGH : Severity.MEDIUM,
					`No face detected for ${duration.toFixed(1)} seconds`,
					duration
				);
			}
			noFaceStart.current = null;
		}

		setIsRecording(false);
		setSession((prev) => ({
			...prev,
			endTime: new Date(),
		}));
		setVideoStats((prev) => ({ ...prev, isVideoActive: false }));
	}, [addEvent, handleFocusRegained]);

	const generateReport = useCallback(() => {
		const duration = session.endTime
			? (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60 // minutes
			: (Date.now() - session.startTime.getTime()) / 1000 / 60;

		const focusLostEvents = session.events.filter(
			(e) => e.type === EventType.FOCUS_LOST
		);
		const suspiciousEvents = session.events.filter((e) =>
			[
				EventType.PHONE_DETECTED,
				EventType.BOOK_DETECTED,
				EventType.DEVICE_DETECTED,
				EventType.MULTIPLE_FACES,
			].includes(e.type)
		);

		return {
			candidateName: session.candidateName,
			sessionId: session.sessionId,
			duration: duration.toFixed(1),
			startTime: session.startTime.toISOString(),
			endTime: session.endTime?.toISOString(),
			integrityScore: session.integrityScore,
			totalEvents: session.events.length,
			focusLostCount: focusLostEvents.length,
			suspiciousEventCount: suspiciousEvents.length,
			events: session.events,
			summary: {
				totalFocusLostTime: videoStats.focusLostDuration.toFixed(1),
				averageFocusLostDuration:
					focusLostEvents.length > 0
						? (
								focusLostEvents.reduce((sum, e) => sum + (e.duration || 0), 0) /
								focusLostEvents.length
						  ).toFixed(1)
						: "0",
			},
		};
	}, [session, videoStats.focusLostDuration]);

	const getFocusStatusColor = () => {
		switch (videoStats.currentFocusState) {
			case FocusType.FOCUSED:
				return "success";
			case FocusType.LOOKING_AWAY:
				return "warning";
			case FocusType.NO_FACE:
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getFocusStatusText = () => {
		switch (videoStats.currentFocusState) {
			case FocusType.FOCUSED:
				return "Focused";
			case FocusType.LOOKING_AWAY:
				return "Looking Away";
			case FocusType.NO_FACE:
				return "No Face Detected";
			default:
				return "Unknown";
		}
	};

	return {
		session,
		videoStats,
		isRecording,
		startSession,
		endSession,
		handleFocusLost,
		handleFocusRegained,
		handleNoFace,
		handleFaceDetected,
		handleObjectDetected,
		generateReport,
		addEvent,
		setIsRecording,
		getFocusStatusColor,
		getFocusStatusText,
	};
};
