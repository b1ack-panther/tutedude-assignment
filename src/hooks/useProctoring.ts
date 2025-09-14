import { useState, useRef, useCallback, useEffect } from 'react';
import { DetectionEvent, ProctoringSession, VideoStats, DetectionConfig } from '@/types/proctoring';

const DEFAULT_CONFIG: DetectionConfig = {
  focusThreshold: 5, // 5 seconds
  faceAbsenceThreshold: 10, // 10 seconds
  enableObjectDetection: true,
  enableFaceDetection: true,
};

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
    currentFocusState: 'focused',
  });

  const [config] = useState<DetectionConfig>(DEFAULT_CONFIG);
  const [isRecording, setIsRecording] = useState(false);
  
  const focusLostStart = useRef<Date | null>(null);
  const noFaceStart = useRef<Date | null>(null);

  const addEvent = useCallback((
    type: DetectionEvent['type'],
    severity: DetectionEvent['severity'],
    description: string,
    duration?: number
  ) => {
    const event: DetectionEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      duration,
      severity,
      description,
    };

    setSession(prev => {
      const newEvents = [...prev.events, event];
      const scoreDeduction = severity === 'high' ? 10 : severity === 'medium' ? 5 : 2;
      const newScore = Math.max(0, prev.integrityScore - scoreDeduction);
      
      return {
        ...prev,
        events: newEvents,
        integrityScore: newScore,
      };
    });

    // Return event for real-time alerts
    return event;
  }, []);

  const handleFocusLost = useCallback(() => {
    if (!focusLostStart.current) {
      focusLostStart.current = new Date();
    }
    
    setVideoStats(prev => ({
      ...prev,
      currentFocusState: 'looking_away',
    }));
  }, []);

  const handleFocusRegained = useCallback(() => {
    if (focusLostStart.current) {
      const duration = (Date.now() - focusLostStart.current.getTime()) / 1000;
      
      if (duration > config.focusThreshold) {
        addEvent(
          'focus_lost',
          duration > 15 ? 'high' : duration > 10 ? 'medium' : 'low',
          `Focus lost for ${duration.toFixed(1)} seconds`,
          duration
        );
      }
      
      focusLostStart.current = null;
      setVideoStats(prev => ({
        ...prev,
        currentFocusState: 'focused',
        focusLostDuration: prev.focusLostDuration + duration,
      }));
    }
  }, [config.focusThreshold, addEvent]);

  const handleNoFace = useCallback(() => {
    if (!noFaceStart.current) {
      noFaceStart.current = new Date();
    }
    
    setVideoStats(prev => ({
      ...prev,
      currentFocusState: 'no_face',
      facesDetected: 0,
    }));
  }, []);

  const handleFaceDetected = useCallback((faceCount: number) => {
    const now = new Date();
    
    if (noFaceStart.current) {
      const duration = (now.getTime() - noFaceStart.current.getTime()) / 1000;
      
      if (duration > config.faceAbsenceThreshold) {
        addEvent(
          'no_face',
          duration > 30 ? 'high' : 'medium',
          `No face detected for ${duration.toFixed(1)} seconds`,
          duration
        );
      }
      
      noFaceStart.current = null;
    }

    if (faceCount > 1) {
      addEvent(
        'multiple_faces',
        'high',
        `Multiple faces detected (${faceCount} faces)`
      );
    }

    setVideoStats(prev => ({
      ...prev,
      facesDetected: faceCount,
      lastFaceDetection: now,
      currentFocusState: 'focused',
    }));

    // If focus was lost, regain it
    if (focusLostStart.current) {
      handleFocusRegained();
    }
  }, [config.faceAbsenceThreshold, addEvent, handleFocusRegained]);

  const handleObjectDetected = useCallback((objectType: string) => {
    const eventType = objectType.includes('phone') ? 'phone_detected' :
                     objectType.includes('book') || objectType.includes('paper') ? 'book_detected' :
                     'device_detected';
    
    addEvent(
      eventType,
      'high',
      `Suspicious object detected: ${objectType}`
    );
  }, [addEvent]);

  const startSession = useCallback(() => {
    setIsRecording(true);
    setVideoStats(prev => ({ ...prev, isVideoActive: true }));
  }, []);

  const endSession = useCallback(() => {
    setIsRecording(false);
    setSession(prev => ({
      ...prev,
      endTime: new Date(),
    }));
    setVideoStats(prev => ({ ...prev, isVideoActive: false }));
  }, []);

  const generateReport = useCallback(() => {
    const duration = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60 // minutes
      : (Date.now() - session.startTime.getTime()) / 1000 / 60;

    const focusLostEvents = session.events.filter(e => e.type === 'focus_lost');
    const suspiciousEvents = session.events.filter(e => 
      ['phone_detected', 'book_detected', 'device_detected', 'multiple_faces'].includes(e.type)
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
        averageFocusLostDuration: focusLostEvents.length > 0 
          ? (focusLostEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / focusLostEvents.length).toFixed(1)
          : '0',
      }
    };
  }, [session, videoStats.focusLostDuration]);

  return {
    session,
    videoStats,
    config,
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
  };
};