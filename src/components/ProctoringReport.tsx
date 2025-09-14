import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Smartphone,
  Book,
  Users
} from 'lucide-react';

interface ProctoringReportProps {
  reportData: any;
  onDownload?: () => void;
  onNewSession?: () => void;
}

export const ProctoringReport: React.FC<ProctoringReportProps> = ({
  reportData,
  onDownload,
  onNewSession
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'focus_lost': return <Eye className="w-4 h-4" />;
      case 'no_face': return <Eye className="w-4 h-4" />;
      case 'multiple_faces': return <Users className="w-4 h-4" />;
      case 'phone_detected': return <Smartphone className="w-4 h-4" />;
      case 'book_detected': return <Book className="w-4 h-4" />;
      case 'device_detected': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEventSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const downloadReport = () => {
    const reportJson = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proctoring-report-${reportData.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onDownload) onDownload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Proctoring Report</h1>
                <p className="text-muted-foreground">Session Analysis & Integrity Assessment</p>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Score:</span>
              <span className={`text-4xl font-bold ${getScoreColor(reportData.integrityScore)}`}>
                {reportData.integrityScore}%
              </span>
            </div>
            <Badge variant={reportData.integrityScore >= 70 ? 'default' : 'destructive'} className="text-sm">
              {getScoreStatus(reportData.integrityScore)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Session Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate:</span>
              <span className="font-medium">{reportData.candidateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session ID:</span>
              <span className="font-mono text-sm">{reportData.sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{reportData.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium">
                {new Date(reportData.startTime).toLocaleString()}
              </span>
            </div>
            {reportData.endTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Time:</span>
                <span className="font-medium">
                  {new Date(reportData.endTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Performance Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Events:</span>
              <span className="font-medium">{reportData.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Focus Lost Count:</span>
              <span className="font-medium">{reportData.focusLostCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suspicious Events:</span>
              <span className="font-medium">{reportData.suspiciousEventCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Focus Lost:</span>
              <span className="font-medium">{reportData.summary.totalFocusLostTime}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. Focus Lost:</span>
              <span className="font-medium">{reportData.summary.averageFocusLostDuration}s</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Event Timeline
        </h3>
        
        {reportData.events.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <p className="text-lg font-medium text-success">Perfect Session!</p>
            <p className="text-muted-foreground">No suspicious events were detected during this interview.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reportData.events.map((event: any, index: number) => (
              <div key={event.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{event.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventSeverityColor(event.severity) as any} className="text-xs">
                          {event.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                        {event.duration && (
                          <span className="text-sm text-muted-foreground">
                            ({event.duration.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          Report generated on {new Date().toLocaleString()}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          {onNewSession && (
            <Button onClick={onNewSession} className="bg-gradient-to-r from-primary to-primary-glow">
              <FileText className="w-4 h-4 mr-2" />
              New Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};