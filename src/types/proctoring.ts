export interface DetectionEvent {
  id: string;
  type: 'focus_lost' | 'no_face' | 'multiple_faces' | 'phone_detected' | 'book_detected' | 'device_detected';
  timestamp: Date;
  duration?: number;
  severity: 'low' | 'medium' | 'high';
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

export interface DetectionConfig {
  focusThreshold: number; // seconds
  faceAbsenceThreshold: number; // seconds
  enableObjectDetection: boolean;
  enableFaceDetection: boolean;
}

export interface VideoStats {
  isVideoActive: boolean;
  facesDetected: number;
  lastFaceDetection: Date | null;
  focusLostDuration: number;
  currentFocusState: 'focused' | 'looking_away' | 'no_face';
}