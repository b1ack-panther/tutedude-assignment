import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Mic, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  User,
  Clock,
  Eye
} from 'lucide-react';

interface CandidateSetupProps {
  onStart: (candidateName: string) => void;
}

export const CandidateSetup: React.FC<CandidateSetupProps> = ({ onStart }) => {
  const [candidateName, setCandidateName] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [cameraTest, setCameraTest] = useState<'pending' | 'success' | 'failed'>('pending');

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraTest('success');
    } catch {
      setCameraTest('failed');
    }
  };

  const handleStart = () => {
    if (candidateName.trim() && hasAgreed && cameraTest === 'success') {
      onStart(candidateName.trim());
    }
  };

  const isReady = candidateName.trim() && hasAgreed && cameraTest === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-gradient-to-br from-card to-card/80 shadow-elegant">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Video Proctoring Setup</h1>
              <p className="text-muted-foreground mt-2">
                Please complete the setup process before starting your interview
              </p>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="candidateName" className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidate Name
              </Label>
              <Input
                id="candidateName"
                type="text"
                placeholder="Enter your full name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="text-lg py-3"
                required
              />
            </div>
          </div>

          {/* System Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              System Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Camera className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium">Camera Access</p>
                  <p className="text-sm text-muted-foreground">Required for face detection</p>
                </div>
                <div className="ml-auto">
                  {cameraTest === 'pending' && (
                    <Button size="sm" onClick={testCamera} variant="outline">
                      Test
                    </Button>
                  )}
                  {cameraTest === 'success' && (
                    <Badge variant="default" className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                  {cameraTest === 'failed' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Eye className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium">Focus Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitors attention during interview</p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground ml-auto">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
            </div>
          </div>

          {/* Proctoring Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Proctoring Guidelines
            </h3>
            
            <Alert className="border-warning/20 bg-warning/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">The following will be monitored during your interview:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Face detection and focus tracking</li>
                    <li>Looking away from screen for more than 5 seconds</li>
                    <li>Multiple faces in the video frame</li>
                    <li>Presence of unauthorized items (phones, books, notes)</li>
                    <li>Electronic devices and suspicious objects</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="p-4 bg-destructive/5 border-destructive/20">
                <Mic className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="font-medium text-destructive">No Phone Calls</p>
                <p className="text-xs text-muted-foreground">Phone detection will trigger alerts</p>
              </Card>
              
              <Card className="p-4 bg-warning/5 border-warning/20">
                <Eye className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="font-medium text-warning">Stay Focused</p>
                <p className="text-xs text-muted-foreground">Look at the screen during interview</p>
              </Card>
              
              <Card className="p-4 bg-success/5 border-success/20">
                <Clock className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="font-medium text-success">Continuous Monitoring</p>
                <p className="text-xs text-muted-foreground">Real-time integrity tracking</p>
              </Card>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreement"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="agreement" className="text-sm leading-relaxed">
                I understand and agree to the proctoring guidelines. I consent to video monitoring 
                and analysis during this interview session. I understand that integrity violations 
                will be recorded and may affect my evaluation.
              </label>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center pt-4">
            <Button
              onClick={handleStart}
              disabled={!isReady}
              className="px-12 py-4 text-lg bg-gradient-to-r from-primary to-primary-glow shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Proctored Interview
            </Button>
            
            {!isReady && (
              <p className="text-sm text-muted-foreground mt-2">
                Please complete all requirements above to continue
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};