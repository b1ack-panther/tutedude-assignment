export interface DetectionEvent {
	id: string;
	type:
		| "focus_lost"
		| "no_face"
		| "multiple_faces"
		| "phone_detected"
		| "book_detected"
		| "other";
	timestamp: Date;
	duration?: number;
	severity: "low" | "medium" | "high";
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
	currentFocusState: "focused" | "looking_away" | "no_face";
}
