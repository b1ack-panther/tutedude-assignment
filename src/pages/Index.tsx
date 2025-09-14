import React, { useState } from 'react';
import { CandidateSetup } from '@/components/CandidateSetup';
import { VideoProctoring } from '@/components/VideoProctoring';
import { ProctoringReport } from '@/components/ProctoringReport';

type AppState = 'setup' | 'proctoring' | 'report';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [candidateName, setCandidateName] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const handleSetupComplete = (name: string) => {
    setCandidateName(name);
    setAppState('proctoring');
  };

  const handleReportGenerated = (report: any) => {
    setReportData(report);
    setAppState('report');
  };

  const handleNewSession = () => {
    setCandidateName('');
    setReportData(null);
    setAppState('setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {appState === 'setup' && (
        <CandidateSetup onStart={handleSetupComplete} />
      )}
      
      {appState === 'proctoring' && (
        <div className="container mx-auto px-4 py-8">
          <VideoProctoring 
            candidateName={candidateName}
            onReportGenerated={handleReportGenerated}
          />
        </div>
      )}
      
      {appState === 'report' && reportData && (
        <div className="container mx-auto px-4 py-8">
          <ProctoringReport 
            reportData={reportData}
            onNewSession={handleNewSession}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
