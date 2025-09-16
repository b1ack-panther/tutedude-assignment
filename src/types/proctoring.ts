export enum Severity {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

export enum EventType {
	FOCUS_LOST = "focus_lost",
	NO_FACE = "no_face",
	MULTIPLE_FACES = "multiple_faces",
	PHONE_DETECTED = "phone_detected",
	BOOK_DETECTED = "book_detected",
	DEVICE_DETECTED = "device_detected",
	OTHER = "other",
}

export enum FocusType {
	FOCUSED = "focused",
	LOOKING_AWAY = "looking_away",
	NO_FACE = "no_face",
}

export interface DetectionEvent {
	id: string;
	type: EventType;
	timestamp: Date;
	duration?: number;
	severity: Severity;
	description: string;
}
export interface ProctoringSession {
	candidateName: string;
	sessionId: string;
	startTime: Date;
	endTime?: Date;
	events: DetectionEvent[];
	integrityScore: number;
}

export const DetectionConfig = {
	focusThreshold: 2,
	faceAbsenceThreshold: 5,
};

export interface VideoStats {
	isVideoActive: boolean;
	facesDetected: number;
	lastFaceDetection: Date | null;
	focusLostDuration: number;
	currentFocusState: FocusType;
}
