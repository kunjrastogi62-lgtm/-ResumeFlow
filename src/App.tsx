/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResumeBuilderView } from './components/editor/ResumeBuilderView';
import { AuthModal } from './components/modals/AuthModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { AiEnhanceBulletModal } from './components/modals/AiEnhanceBulletModal';
import { AiAtsReviewModal } from './components/modals/AiAtsReviewModal';
import { AiTailorModal } from './components/modals/AiTailorModal';
import { AiCoverLetterModal } from './components/modals/AiCoverLetterModal';
import { AiSummaryModal } from './components/modals/AiSummaryModal';
import { ResumeRecord, INITIAL_RESUME, ResumeData } from './types/resume';

function AppContent() {
  const { user, configModalOpen, setConfigModalOpen } = useAuth();

  const [view, setView] = useState<'landing' | 'dashboard' | 'editor'>('landing');
  const [activeResumeRecord, setActiveResumeRecord] = useState<ResumeRecord | null>(null);

  // Active builder resume data (for modals that need current state)
  const [activeResumeData, setActiveResumeData] = useState<ResumeData>(INITIAL_RESUME);

  // Modals state
  const [bulletModal, setBulletModal] = useState<{
    open: boolean;
    original: string;
    role: string;
    onApply: (b: string) => void;
  }>({
    open: false,
    original: '',
    role: '',
    onApply: () => {},
  });

  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  // Navigation handlers
  const handleStartBuilding = (templateId?: string) => {
    const defaultData = {
      ...INITIAL_RESUME,
    };
    setActiveResumeRecord({
      id: `local-${Date.now()}`,
      user_id: user?.id || 'guest',
      title: 'My AI Resume',
      template: templateId || 'professional-classic',
      resume_data: defaultData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActiveResumeData(defaultData);
    setView('editor');
  };

  const handleOpenResumeFromDashboard = (record: ResumeRecord) => {
    setActiveResumeRecord(record);
    setActiveResumeData(record.resume_data || INITIAL_RESUME);
    setView('editor');
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0]">
      {/* View routing */}
      {view === 'landing' && (
        <LandingPage
          onStartBuilding={handleStartBuilding}
          onExploreTemplates={() => {
            const el = document.getElementById('templates');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenDashboard={() => setView('dashboard')}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          onOpenResume={handleOpenResumeFromDashboard}
          onCreateNew={() => handleStartBuilding()}
          onBackToHome={() => setView('landing')}
        />
      )}

      {view === 'editor' && (
        <ResumeBuilderView
          initialRecord={activeResumeRecord}
          onResumeDataChange={(updated) => setActiveResumeData(updated)}
          onBackToDashboard={() => setView(user ? 'dashboard' : 'landing')}
          onOpenATSModal={() => setAtsModalOpen(true)}
          onOpenTailorModal={() => setTailorModalOpen(true)}
          onOpenCoverLetterModal={() => setCoverLetterModalOpen(true)}
          onOpenSummaryModal={() => setSummaryModalOpen(true)}
          onOpenBulletModal={(bullet, role, onApply) => {
            setBulletModal({
              open: true,
              original: bullet,
              role,
              onApply,
            });
          }}
        />
      )}

      {/* Global Modals */}
      <AuthModal />
      <SupabaseConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />

      {/* AI Bullet Enhancer Modal */}
      <AiEnhanceBulletModal
        isOpen={bulletModal.open}
        onClose={() => setBulletModal((prev) => ({ ...prev, open: false }))}
        originalBullet={bulletModal.original}
        roleContext={bulletModal.role}
        onApply={bulletModal.onApply}
      />

      {/* AI ATS Review Modal */}
      <AiAtsReviewModal
        isOpen={atsModalOpen}
        onClose={() => setAtsModalOpen(false)}
        resumeData={activeResumeData}
      />

      {/* AI Tailor to Job Modal */}
      <AiTailorModal
        isOpen={tailorModalOpen}
        onClose={() => setTailorModalOpen(false)}
        resumeData={activeResumeData}
        onApplyBullet={(secIdx, itemIdx, suggested) => {
          const updated = {
            ...activeResumeData,
            work: activeResumeData.work.map((w, idx) =>
              idx === secIdx
                ? {
                    ...w,
                    highlights: w.highlights.map((h, hIdx) => (hIdx === itemIdx ? suggested : h)),
                  }
                : w
            ),
          };
          setActiveResumeData(updated);
          if (activeResumeRecord) {
            setActiveResumeRecord({ ...activeResumeRecord, resume_data: updated });
          }
        }}
      />

      {/* AI Cover Letter Modal */}
      <AiCoverLetterModal
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        resumeData={activeResumeData}
      />

      {/* AI Summary Modal */}
      <AiSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        resumeData={activeResumeData}
        onApply={(summary) => {
          const updated = {
            ...activeResumeData,
            basics: {
              ...activeResumeData.basics,
              summary,
            },
          };
          setActiveResumeData(updated);
          if (activeResumeRecord) {
            setActiveResumeRecord({ ...activeResumeRecord, resume_data: updated });
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
