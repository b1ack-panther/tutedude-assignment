# Video Proctoring System 🎯

An advanced AI-powered video proctoring system for secure online interviews with real-time focus detection and object recognition.

## Features ✨

### Core Functionality
- **Real-time Face Detection**: Monitors candidate presence and attention
- **Focus Tracking**: Detects when candidates look away for more than 5 seconds
- **Object Detection**: Identifies unauthorized items (phones, books, notes, devices)
- **Multi-face Detection**: Alerts when multiple people appear in frame
- **Live Event Logging**: Real-time tracking with timestamps
- **Integrity Scoring**: Dynamic scoring system with deductions for violations

### Technical Capabilities
- **Modern UI**: Clean, professional interface built with React & TypeScript
- **Responsive Design**: Works on desktop and tablet devices
- **Real-time Processing**: Live video analysis with immediate feedback
- **Comprehensive Reporting**: Detailed session reports with event timeline
- **Export Functionality**: Download reports in JSON format

## Technology Stack 🛠️

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui with custom design system
- **Video Processing**: WebRTC, Canvas API
- **AI Detection**: TensorFlow.js, MediaPipe (ready for integration)
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Deployment**: Lovable Platform

## Quick Start 🚀

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd video-proctoring-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage
1. **Setup Phase**: Enter candidate name and complete system checks
2. **Camera Testing**: Verify camera access and permissions
3. **Start Proctoring**: Begin monitored interview session
4. **Live Monitoring**: Real-time detection and event logging
5. **Generate Report**: Complete session with detailed integrity report

## Detection Rules 📋

### Focus Detection
- **Looking Away**: Triggers after 5+ seconds of no eye contact
- **No Face**: Alerts after 10+ seconds of no face detection
- **Multiple Faces**: Immediate alert for additional people in frame

### Object Detection
- **Mobile Phones**: High-severity violation
- **Books/Papers**: High-severity violation for notes
- **Electronic Devices**: Medium to high-severity based on type

### Scoring System
- **Starting Score**: 100%
- **High Violations**: -10 points
- **Medium Violations**: -5 points  
- **Low Violations**: -2 points

## Project Structure 📁

```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   ├── CandidateSetup.tsx # Setup and onboarding
│   ├── VideoProctoring.tsx # Main proctoring interface
│   └── ProctoringReport.tsx # Results and reporting
├── hooks/
│   └── useProctoring.ts  # Core proctoring logic
├── types/
│   └── proctoring.ts     # TypeScript interfaces
├── pages/
│   └── Index.tsx         # Main application page
└── lib/
    └── utils.ts          # Utility functions
```

## Key Components 🧩

### CandidateSetup
- Candidate information collection
- System requirements verification
- Camera permission testing
- Proctoring rules explanation
- Consent management

### VideoProctoring  
- Live video feed display
- Real-time detection overlay
- Event alert system
- Session statistics
- Control interface

### ProctoringReport
- Comprehensive session analysis
- Event timeline with details
- Integrity score calculation
- Export functionality
- New session initiation

## Configuration ⚙️

### Detection Thresholds
```typescript
const DEFAULT_CONFIG = {
  focusThreshold: 5,        // seconds
  faceAbsenceThreshold: 10, // seconds
  enableObjectDetection: true,
  enableFaceDetection: true,
};
```

### Scoring Parameters
```typescript
// Score deductions by severity
const scoreDeduction = {
  high: 10,    // phones, multiple faces
  medium: 5,   // extended focus loss
  low: 2       // brief focus loss
};
```

## Browser Requirements 🌐

- **Chrome 90+** (Recommended)
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

### Required Permissions
- Camera access for video monitoring
- Microphone access (optional, for enhanced detection)

## Future Enhancements 🔮

### Planned Features
- **Eye Closure Detection**: Drowsiness monitoring
- **Audio Analysis**: Background voice detection  
- **Advanced AI Models**: Improved accuracy with YOLO/TensorFlow.js
- **Backend Integration**: Database storage with MongoDB/Firebase
- **Live Interviewer Alerts**: Real-time notifications
- **Mobile Support**: Responsive mobile interface

### AI Integration Roadmap
- MediaPipe Face Mesh for precise face tracking
- TensorFlow.js object detection models
- Custom trained models for interview-specific scenarios
- Real-time pose estimation
- Emotion detection capabilities

## Development Notes 💻

### Mock Detection
Current implementation uses mock detection for demonstration. Production deployment requires:
- TensorFlow.js model integration
- MediaPipe setup for face detection
- YOLO model for object detection
- Camera calibration routines

### Performance Optimization
- Canvas-based video processing
- Efficient animation loops
- Memory management for long sessions
- Optimized detection algorithms

## Contributing 🤝

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License 📄

This project is part of the Tutedude SDE Assignment and is intended for educational and demonstration purposes.

## Deployment 🌐

The application is optimized for deployment on the Lovable platform with automatic CI/CD integration.

### Live Demo
- **Deployed URL**: [Your Lovable App URL]
- **Demo Video**: [Link to demo video]
- **Sample Report**: [Link to sample proctoring report]

---

**Built with ❤️ for secure online interviews**

For questions or support, please refer to the project documentation or create an issue in the repository.