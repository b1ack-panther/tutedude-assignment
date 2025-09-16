import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProctoring } from "@/hooks/useProctoring";
import { DetectionEvent } from "@/types/proctoring";
import { Camera, CameraOff, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useDetection } from "@/hooks/use-detection";
import { createMediaRecorderController } from "@/lib/utils";

interface VideoProctoringProps {
	candidateName: string;
	onReportGenerated?: (report: any) => void;
}

export const VideoProctoring: React.FC<VideoProctoringProps> = ({
	candidateName,
	onReportGenerated,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const recorderControllerRef = useRef<ReturnType<
		typeof createMediaRecorderController
	> | null>(null);

	const [recentAlert, setRecentAlert] = useState<DetectionEvent | null>(null);
	const [permissionDenied, setPermissionDenied] = useState(false);

	const {
		session,
		videoStats,
		isRecording,
		startSession,
		endSession,
		handleFaceDetected,
		handleNoFace,
		handleFocusLost,
		handleObjectDetected,
		generateReport,
		setIsRecording,
		getFocusStatusColor,
		getFocusStatusText,
		handleFocusRegained,
	} = useProctoring(candidateName);

	// Initialize camera
	const initializeCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: 640,
					height: 480,
					facingMode: "user",
				},
				audio: false,
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
				setIsRecording(true);
				setPermissionDenied(false);
				// Prepare recording controller
				recorderControllerRef.current = createMediaRecorderController(stream);
			}
		} catch (error) {
			console.error("Failed to initialize camera:", error);
			setIsRecording(false);
			setPermissionDenied(true);
		}
	};

	const detectionResult = useDetection(videoRef, isRecording);
	const { facesDetected, isLookingAway, objects, isModelsLoading } =
		detectionResult;

	useEffect(() => {
		if (!isRecording) return;

		if (facesDetected === 0) {
			handleNoFace();
		} else {
			handleFaceDetected(facesDetected);
		}

		if (isLookingAway) {
			handleFocusLost();
		} else {
			handleFocusRegained();
		}

		if (objects.length > 0) {
			objects.forEach((obj) => handleObjectDetected(obj));
		}
	}, [
		facesDetected,
		isLookingAway,
		objects,
		handleFaceDetected,
		handleNoFace,
		handleFocusLost,
		handleFocusRegained,
		handleObjectDetected,
		isRecording,
	]);

	useEffect(() => {
		if (session.events.length > 0) {
			const latestEvent = session.events[session.events.length - 1];
			setRecentAlert(latestEvent);

			const timer = setTimeout(() => setRecentAlert(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [session.events]);

	const handleStart = async () => {
		if (!isRecording) {
			await initializeCamera();
		}
		startSession();
		recorderControllerRef.current?.start(1000);
	};

	const handleStop = async () => {
		endSession();
		const url = await recorderControllerRef.current?.stop();
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
		}
		setIsRecording(false);
		if (onReportGenerated) {
			const base = generateReport();
			onReportGenerated({
				...base,
				recordingUrl: url || recorderControllerRef.current?.getUrl() || null,
			});
		}
	};
	// console.log(detectionResult);

	return (
		<div className="space-y-6">
			{/* Main Video Interface */}
			<Card className="p-6 bg-gradient-to-br from-card to-card/50 max-w-3xl mx-auto">
				<div className="space-y-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-foreground">
								Interview Session
							</h2>
							<p className="text-muted-foreground">
								Candidate: {candidateName}
							</p>
						</div>
						{isRecording && (
							<div className="flex items-center gap-3">
								<Badge
									variant={getFocusStatusColor() as any}
									className="px-3 py-1"
								>
									{videoStats.currentFocusState === "focused" ? (
										<Eye className="w-4 h-4 mr-1" />
									) : (
										<EyeOff className="w-4 h-4 mr-1" />
									)}
									{getFocusStatusText()}
								</Badge>
								<Badge variant="outline" className="px-3 py-1">
									Score: {session.integrityScore}%
								</Badge>
							</div>
						)}
					</div>

					{/* Video Container */}
					<div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
						{permissionDenied ? (
							<div className="absolute inset-0 flex items-center justify-center bg-muted">
								<div className="text-center space-y-4">
									<CameraOff className="w-16 h-16 text-muted-foreground mx-auto" />
									<div>
										<p className="text-lg font-semibold">
											Camera Access Denied
										</p>
										<p className="text-muted-foreground">
											Please allow camera access to continue
										</p>
									</div>
									<Button onClick={initializeCamera} variant="outline">
										Retry Camera Access
									</Button>
								</div>
							</div>
						) : (
							<>
								<video
									ref={videoRef}
									autoPlay
									muted
									playsInline
									className="w-full h-full object-cover"
								/>

								{/* Status Overlay */}
								<div className="absolute top-4 left-4 space-y-2">
									{isRecording && (
										<Badge variant="destructive" className="animate-pulse">
											<div className="w-2 h-2 bg-white rounded-full mr-2" />
											Recording
										</Badge>
									)}
									{videoStats.facesDetected > 0 && (
										<Badge variant="secondary">
											{videoStats.facesDetected} Face
											{videoStats.facesDetected > 1 ? "s" : ""}
										</Badge>
									)}
								</div>

								{/* Detection Info */}
								<div className="absolute bottom-4 right-4 space-y-1">
									<div className="text-sm text-white bg-black/50 px-3 py-1 rounded">
										Events: {session.events.length}
									</div>
									{videoStats.lastFaceDetection && (
										<div className="text-sm text-white bg-black/50 px-3 py-1 rounded">
											Last Face:{" "}
											{new Date(
												videoStats.lastFaceDetection
											).toLocaleTimeString()}
										</div>
									)}
								</div>
							</>
						)}
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-4">
						{!isRecording ? (
							<Button
								onClick={handleStart}
								disabled={isModelsLoading}
								className="px-8 py-3 bg-gradient-to-r from-primary to-primary-glow disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Camera className="w-5 h-5 mr-2" />
								{isModelsLoading ? "Loading models..." : "Start Proctoring"}
							</Button>
						) : (
							<Button
								onClick={handleStop}
								variant="destructive"
								className="px-8 py-3"
							>
								<CameraOff className="w-5 h-5 mr-2" />
								Stop Session
							</Button>
						)}
					</div>
				</div>
			</Card>

			{/* Real-time Alert */}
			{recentAlert && (
				<Alert
					className={`border-l-4 ${
						recentAlert.severity === "high"
							? "border-destructive bg-alert-bg"
							: recentAlert.severity === "medium"
							? "border-warning bg-warning/10"
							: "border-primary bg-success-bg"
					}`}
				>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription className="font-medium">
						<span className="capitalize">
							{recentAlert.type.replace("_", " ")}
						</span>
						: {recentAlert.description}
						<span className="text-muted-foreground ml-2">
							{recentAlert.timestamp.toLocaleTimeString()}
						</span>
					</AlertDescription>
				</Alert>
			)}

			{/* Live Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="p-4 text-center">
					<div className="text-2xl font-bold text-primary">
						{session.integrityScore}%
					</div>
					<div className="text-sm text-muted-foreground">Integrity Score</div>
				</Card>
				<Card className="p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						{session.events.length}
					</div>
					<div className="text-sm text-muted-foreground">Total Events</div>
				</Card>
				<Card className="p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						{Math.floor(videoStats.focusLostDuration)}s
					</div>
					<div className="text-sm text-muted-foreground">Focus Lost</div>
				</Card>
				<Card className="p-4 text-center">
					<div className="text-2xl font-bold text-foreground">
						{Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)}
						m
					</div>
					<div className="text-sm text-muted-foreground">Session Time</div>
				</Card>
			</div>
		</div>
	);
};
