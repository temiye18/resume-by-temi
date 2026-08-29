import { type FC, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { saveAs } from 'file-saver';
import EditorTopBar from '../EditorTopBar/EditorTopBar';
import SidePanel from '../SidePanel/SidePanel';
import EditorCanvas from '../EditorCanvas/EditorCanvas';
import EditorTabContent from '../EditorTabContent/EditorTabContent';
import MobileTabBar from '../MobileTabBar/MobileTabBar';
import AtsCheckModal from '../AtsCheckModal/AtsCheckModal';
import TailorDrawer from '../TailorDrawer/TailorDrawer';
import { useResumeStore, useResumeTemporal } from '@/store/resumeStore';
import { getResume } from '@/db/repository';
import { startAutosave, stopAutosave, flushAutosaveNow } from '@/store/middleware/autosave';
import { generatePdf } from '@/pdf/generatePdf';
import { embedResumeSource } from '@/pdf/embedSource';
import { atsCheck } from '@/pdf/atsCheck';
import { generateDocx } from '@/docx/generateDocx';
import { toExportEnvelope } from '@/helpers';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import type { EditorTab } from '@/types/editor-tab-type';
import type { IAtsCheckResult } from '@/interfaces/i-ats-check-result';

interface IEditorShellProps {
  resumeId: string;
}

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'resume';

const EditorShell: FC<IEditorShellProps> = ({ resumeId }) => {
  const navigate = useNavigate();
  const load = useResumeStore((s) => s.load);
  const resume = useResumeStore((s) => s.resume);
  const name = useResumeStore((s) => s.name);
  const templateId = useResumeStore((s) => s.templateId);
  const theme = useResumeStore((s) => s.theme);
  const reset = useResumeStore((s) => s.reset);

  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<EditorTab>('sections');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [docxBusy, setDocxBusy] = useState(false);
  const [atsBusy, setAtsBusy] = useState(false);
  const [atsResult, setAtsResult] = useState<IAtsCheckResult | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const record = await getResume(resumeId);
      if (cancelled) return;
      if (!record) {
        setLoadState('missing');
        return;
      }
      const temporal = useResumeTemporal.getState();
      temporal.pause();
      load(record);
      temporal.clear();
      temporal.resume();
      setLoadState('ready');
      startAutosave();
    })();
    return () => {
      cancelled = true;
      stopAutosave(false);
      void flushAutosaveNow();
      reset();
    };
  }, [resumeId, load, reset]);

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      const blob = await generatePdf({ resume, templateId, theme });
      const envelope = JSON.stringify(toExportEnvelope({ resume, templateId, theme, name }));
      const withSource = await embedResumeSource(blob, envelope);
      saveAs(withSource, `${slugify(name)}.pdf`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      window.alert(`Could not generate PDF: ${message}`);
      throw err;
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDownloadDocx = async () => {
    setDocxBusy(true);
    try {
      const blob = await generateDocx(resume);
      saveAs(blob, `${slugify(name)}.docx`);
    } finally {
      setDocxBusy(false);
    }
  };

  const handleDownloadJson = () => {
    const envelope = toExportEnvelope({ resume, templateId, theme, name });
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    saveAs(blob, `${slugify(name)}.json`);
  };

  const handleAtsCheck = async () => {
    setAtsBusy(true);
    setAtsOpen(true);
    setAtsResult(null);
    try {
      const blob = await generatePdf({ resume, templateId, theme });
      const result = await atsCheck(blob, resume, { jobDescription });
      setAtsResult(result);
    } finally {
      setAtsBusy(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading résumé…</p>
      </div>
    );
  }

  if (loadState === 'missing') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <h1 className="font-display text-3xl font-medium text-ink">Résumé not found</h1>
        <p className="font-sans text-md text-ink-soft">
          We couldn't find that document in this browser's storage.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: '/app' })}
          className="inline-flex h-10 items-center rounded-sm bg-ink px-4 font-sans text-sm font-medium text-bg transition-colors duration-fast ease-out-quart hover:bg-accent"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="flex h-screen flex-col bg-bg">
        <EditorTopBar
          onDownload={handleDownloadPdf}
          downloading={pdfBusy}
          onOpenTailor={() => setTailorOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden">
          <SidePanel
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onDownloadPdf={handleDownloadPdf}
            onDownloadDocx={handleDownloadDocx}
            onDownloadJson={handleDownloadJson}
            onAtsCheck={handleAtsCheck}
            onOpenTailor={() => setTailorOpen(true)}
            jobDescription={jobDescription}
            onChangeJobDescription={setJobDescription}
            pdfBusy={pdfBusy}
            docxBusy={docxBusy}
            atsBusy={atsBusy}
          />
          <main className="flex-1 overflow-hidden">
            <EditorCanvas />
          </main>
        </div>
        <AtsCheckModal
          open={atsOpen}
          busy={atsBusy}
          result={atsResult}
          onClose={() => setAtsOpen(false)}
        />
        <TailorDrawer
          open={tailorOpen}
          onClose={() => setTailorOpen(false)}
          resumeId={resumeId}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-bg">
      <EditorTopBar
        onDownload={handleDownloadPdf}
        downloading={pdfBusy}
        onOpenTailor={() => setTailorOpen(true)}
      />
      <main className="flex-1 overflow-hidden">
        {activeTab === 'preview' ? (
          <EditorCanvas />
        ) : (
          <div className="h-full overflow-y-auto scrollbar-slim">
            <EditorTabContent
              activeTab={activeTab}
              onDownloadPdf={handleDownloadPdf}
              onDownloadDocx={handleDownloadDocx}
              onDownloadJson={handleDownloadJson}
              onAtsCheck={handleAtsCheck}
              onOpenTailor={() => setTailorOpen(true)}
              jobDescription={jobDescription}
              onChangeJobDescription={setJobDescription}
              pdfBusy={pdfBusy}
              docxBusy={docxBusy}
              atsBusy={atsBusy}
            />
          </div>
        )}
      </main>
      <MobileTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
      <AtsCheckModal
        open={atsOpen}
        busy={atsBusy}
        result={atsResult}
        onClose={() => setAtsOpen(false)}
      />
      <TailorDrawer
        open={tailorOpen}
        onClose={() => setTailorOpen(false)}
        resumeId={resumeId}
      />
    </div>
  );
};

export default EditorShell;
