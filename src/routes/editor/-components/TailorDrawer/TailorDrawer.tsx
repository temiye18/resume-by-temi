import { type FC, type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { produce } from 'immer';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, AiMagicIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import { useResumeStore } from '@/store/resumeStore';
import { useTailorStore } from '@/store/tailorStore';
import { analyzeJobMatch, tailorMutator } from '@/helpers';
import { atsThinkingSteps, atsReasoningLines } from '@/constants';
import { getResume, saveTailoredVersion } from '@/db/repository';
import { generatePdf } from '@/pdf/generatePdf';
import { atsCheck } from '@/pdf/atsCheck';
import JobMatchMeter from '../JobMatchMeter/JobMatchMeter';
import TailorSuggestionCard from '../TailorSuggestionCard/TailorSuggestionCard';
import TailorThinking from '../TailorThinking/TailorThinking';
import type { IJobMatch } from '@/interfaces/i-job-match';

interface ITailorDrawerProps {
  open: boolean;
  onClose: () => void;
  resumeId: string;
}

const MIN_JD = 40;

const TailorDrawer: FC<ITailorDrawerProps> = ({ open, onClose, resumeId }) => {
  const baseResume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);
  const name = useResumeStore((s) => s.name);
  const templateId = useResumeStore((s) => s.templateId);
  const theme = useResumeStore((s) => s.theme);

  const mode = useTailorStore((s) => s.mode);
  const atsScore = useTailorStore((s) => s.atsScore);
  const atsFindings = useTailorStore((s) => s.atsFindings);
  const openForAts = useTailorStore((s) => s.openForAts);
  const status = useTailorStore((s) => s.status);
  const jobDescription = useTailorStore((s) => s.jobDescription);
  const jobTitle = useTailorStore((s) => s.jobTitle);
  const company = useTailorStore((s) => s.company);
  const suggestions = useTailorStore((s) => s.suggestions);
  const decisions = useTailorStore((s) => s.decisions);
  const error = useTailorStore((s) => s.error);
  const snapshot = useTailorStore((s) => s.match);
  const setJobDescription = useTailorStore((s) => s.setJobDescription);
  const setJobTitle = useTailorStore((s) => s.setJobTitle);
  const setCompany = useTailorStore((s) => s.setCompany);
  const start = useTailorStore((s) => s.start);
  const stop = useTailorStore((s) => s.stop);
  const decide = useTailorStore((s) => s.decide);
  const decideAllPending = useTailorStore((s) => s.decideAllPending);
  const editSuggestion = useTailorStore((s) => s.editSuggestion);
  const reset = useTailorStore((s) => s.reset);

  const reduceMotion = useReducedMotion();
  const [flash, setFlash] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const isAts = mode === 'ats';
  const thinkingProps = isAts
    ? { label: 'ATS agent', steps: atsThinkingSteps, lines: atsReasoningLines }
    : {};
  const jd = jobDescription.trim();
  const jdReady = jd.length >= MIN_JD;
  const streaming = status === 'streaming';

  const accepted = useMemo(
    () => suggestions.filter((s) => decisions[s.id] === 'accepted'),
    [suggestions, decisions],
  );
  const pendingCount = suggestions.filter(
    (s) => (decisions[s.id] ?? 'pending') === 'pending',
  ).length;

  const workingResume = useMemo(() => {
    if (accepted.length === 0) return baseResume;
    return produce(baseResume, (draft) => {
      for (const s of accepted) tailorMutator(s)(draft);
    });
  }, [baseResume, accepted]);

  const liveMatch = useMemo<IJobMatch | null>(
    () => (jdReady ? analyzeJobMatch(workingResume, jd) : null),
    [workingResume, jd, jdReady],
  );

  const meterValue = liveMatch?.coverage ?? 0;
  const baseline = snapshot?.coverage ?? meterValue;
  const delta = suggestions.length > 0 ? meterValue - baseline : null;

  const requestClose = () => {
    if (suggestions.length > 0) setConfirmClose(true);
    else onClose();
  };

  const confirmedClose = () => {
    setConfirmClose(false);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmClose) setConfirmClose(false);
      else if (suggestions.length > 0) setConfirmClose(true);
      else onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, confirmClose, suggestions.length]);

  const focusFindings =
    liveMatch && liveMatch.missingSkills.length > 0
      ? [`Skills named in the JD but missing from the resume: ${liveMatch.missingSkills.slice(0, 14).join(', ')}`]
      : undefined;

  const handleEnhance = () => {
    setFlash(null);
    void start(baseResume, isAts ? undefined : focusFindings);
  };

  const handleApplyAndRecheck = async () => {
    const applied = workingResume;
    setResume(applied);
    setFlash(null);
    setRechecking(true);
    try {
      const blob = await generatePdf({ resume: applied, templateId, theme });
      const result = await atsCheck(blob, applied);
      openForAts(
        result.score,
        result.findings.map((f) => `${f.rule} — ${f.message}`),
      );
      setFlash(`Applied. ATS score is now ${result.score}.`);
    } catch {
      setFlash('Applied. Re-run the ATS check from the Export tab to see the new score.');
    } finally {
      setRechecking(false);
    }
  };

  const handleApply = () => {
    const count = accepted.length;
    const score = meterValue;
    setResume(workingResume);
    reset();
    setFlash(`Applied ${count} change${count === 1 ? '' : 's'}. Job match is now ${score}%.`);
  };

  const handleSaveVersion = async () => {
    const record = await getResume(resumeId);
    if (!record) return;
    const label = [jobTitle.trim(), company.trim()].filter(Boolean).join(' at ');
    const versionName = label ? `${name} — ${label}` : `${name} (tailored)`;
    await saveTailoredVersion(
      record,
      workingResume,
      { title: jobTitle.trim(), company: company.trim(), jobDescription: jd },
      versionName,
    );
    reset();
    setFlash(`Saved “${versionName}”. Find it on your dashboard.`);
  };

  const handleStartOver = () => {
    setFlash(null);
    if (isAts && atsScore != null) {
      openForAts(atsScore, atsFindings);
    } else {
      reset();
    }
  };

  const summary = liveMatch
    ? liveMatch.missingSkills.length > 0
      ? `${meterValue}% match · ${liveMatch.missingSkills.length} skill${liveMatch.missingSkills.length === 1 ? '' : 's'} to surface`
      : `${meterValue}% match · every JD skill is covered`
    : 'Paste a job description to read the match.';

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-[70] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="absolute inset-0 bg-bg/70 backdrop-blur-[2px]"
          />
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tailor to a job"
            className="relative flex h-full w-full max-w-[460px] flex-col border-l border-border bg-bg shadow-modal"
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-lg font-medium text-ink">
                  {isAts ? 'Improve for ATS' : 'Tailor to a job'}
                </h2>
                <p className="font-sans text-xs text-muted">
                  {isAts
                    ? 'Fixes for the flagged issues — grounded in your résumé.'
                    : 'Rewrites grounded in your résumé — nothing invented.'}
                </p>
              </div>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors duration-fast ease-out-quart hover:bg-surface hover:text-ink focus-visible:outline-none"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
              </button>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-slim">
              <div className="flex flex-col gap-5 px-5 py-5">
                {isAts ? (
                  <div className="flex items-center gap-4 rounded-md border border-border bg-surface-sunk/40 p-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'font-display text-3xl font-semibold leading-none tabular-nums',
                          atsScore == null && 'text-ink',
                          atsScore != null && atsScore >= 90 && 'text-success',
                          atsScore != null && atsScore >= 70 && atsScore < 90 && 'text-warning',
                          atsScore != null && atsScore < 70 && 'text-danger',
                        )}
                      >
                        {atsScore ?? '—'}
                      </span>
                      <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
                        score
                      </span>
                    </div>
                    <p className="flex-1 font-sans text-sm text-ink-soft text-pretty">
                      {atsFindings.length > 0
                        ? `${atsFindings.length} issue${atsFindings.length === 1 ? '' : 's'} flagged. AI will fix the content ones; apply and re-check to see the score move.`
                        : 'Let AI tighten your résumé, then apply and re-check.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={jobTitle}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)}
                          placeholder="Job title"
                          className="h-9 rounded-sm border border-border bg-bg px-2.5 font-sans text-sm text-ink placeholder:text-muted transition-colors duration-fast ease-out-quart focus:border-accent focus:outline-none"
                        />
                        <input
                          value={company}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                          placeholder="Company"
                          className="h-9 rounded-sm border border-border bg-bg px-2.5 font-sans text-sm text-ink placeholder:text-muted transition-colors duration-fast ease-out-quart focus:border-accent focus:outline-none"
                        />
                      </div>
                      <textarea
                        autoFocus
                        value={jobDescription}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description."
                        rows={5}
                        className="resize-none rounded-sm border border-border bg-bg px-2.5 py-2 font-sans text-sm text-ink placeholder:text-muted transition-colors duration-fast ease-out-quart focus:border-accent focus:outline-none scrollbar-slim"
                      />
                    </div>

                    {jdReady ? (
                      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunk/40 p-4">
                        <JobMatchMeter value={meterValue} caption={summary} delta={delta} />
                        {liveMatch && liveMatch.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {liveMatch.missingSkills.slice(0, 10).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-xs border border-border bg-bg px-1.5 py-0.5 font-mono text-2xs text-ink-soft"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}

                {!streaming ? (
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={!isAts && !jdReady}
                    className={cn(
                      'inline-flex h-10 items-center justify-center gap-2 rounded-sm font-sans text-sm font-medium transition-[background-color,transform] duration-fast ease-out-quart focus-visible:outline-none',
                      isAts || jdReady
                        ? 'bg-ink text-bg hover:bg-accent active:translate-y-px'
                        : 'cursor-not-allowed bg-surface text-muted',
                    )}
                  >
                    <HugeiconsIcon icon={AiMagicIcon} size={16} strokeWidth={1.5} />
                    {isAts
                      ? suggestions.length > 0
                        ? 'Find more fixes'
                        : 'Fix with AI'
                      : suggestions.length > 0
                        ? 'Enhance again'
                        : 'Enhance with AI'}
                  </button>
                ) : null}

                {error ? (
                  <p className="rounded-sm border border-danger/40 bg-danger-soft px-3 py-2 font-sans text-sm text-danger">
                    {error}
                  </p>
                ) : null}

                {streaming && suggestions.length === 0 ? (
                  <TailorThinking variant="full" onStop={stop} {...thinkingProps} />
                ) : null}

                {suggestions.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {pendingCount > 1 ? (
                      <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface-sunk/40 px-3 py-2">
                        <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
                          {pendingCount} to review
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decideAllPending('rejected')}
                            className="font-mono text-2xs uppercase tracking-[0.16em] text-muted underline decoration-1 underline-offset-2 transition-colors duration-fast ease-out-quart hover:text-ink focus-visible:outline-none"
                          >
                            Skip all
                          </button>
                          <button
                            type="button"
                            onClick={() => decideAllPending('accepted')}
                            className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-ink px-2.5 font-sans text-xs font-medium text-bg transition-[background-color] duration-fast ease-out-quart hover:bg-accent focus-visible:outline-none"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} strokeWidth={1.75} />
                            Accept all
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {suggestions.map((s, i) => (
                      <TailorSuggestionCard
                        key={s.id}
                        suggestion={s}
                        decision={decisions[s.id] ?? 'pending'}
                        animate={i === suggestions.length - 1 && streaming}
                        onDecide={(d) => decide(s.id, d)}
                        onEdit={(after) => editSuggestion(s.id, after)}
                      />
                    ))}
                    {streaming ? <TailorThinking variant="strip" onStop={stop} {...thinkingProps} /> : null}
                  </div>
                ) : !streaming && (isAts || jdReady) && status !== 'error' ? (
                  <p className="font-sans text-sm text-muted text-pretty">
                    {isAts
                      ? 'Run the AI fix to see line-by-line rewrites that close each flagged issue — you accept or skip every one, and nothing changes until you do.'
                      : 'Enhance to see line-by-line rewrites that close each gap. You accept or skip every one — nothing changes until you do.'}
                  </p>
                ) : null}
              </div>
            </div>

            <footer className="border-t border-border px-5 py-4">
              {flash ? (
                <p className="mb-3 flex items-start gap-2 font-sans text-sm text-accent-ink dark:text-accent">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                  {flash}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                {isAts ? (
                  <button
                    type="button"
                    onClick={() => void handleApplyAndRecheck()}
                    disabled={accepted.length === 0 || rechecking}
                    className={cn(
                      'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm font-sans text-sm font-medium transition-colors duration-fast ease-out-quart focus-visible:outline-none',
                      accepted.length > 0 && !rechecking
                        ? 'bg-ink text-bg hover:bg-accent'
                        : 'cursor-not-allowed bg-surface text-muted',
                    )}
                  >
                    {rechecking ? 'Re-checking ATS…' : 'Apply & re-check ATS'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={accepted.length === 0}
                      className={cn(
                        'inline-flex h-10 flex-1 items-center justify-center rounded-sm font-sans text-sm font-medium transition-colors duration-fast ease-out-quart focus-visible:outline-none',
                        accepted.length > 0
                          ? 'bg-ink text-bg hover:bg-accent'
                          : 'cursor-not-allowed bg-surface text-muted',
                      )}
                    >
                      Apply to this résumé
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveVersion()}
                      disabled={accepted.length === 0}
                      className={cn(
                        'inline-flex h-10 flex-1 items-center justify-center rounded-sm border font-sans text-sm font-medium transition-colors duration-fast ease-out-quart focus-visible:outline-none',
                        accepted.length > 0
                          ? 'border-border bg-bg text-ink hover:border-border-strong'
                          : 'cursor-not-allowed border-border bg-surface text-muted',
                      )}
                    >
                      Save as version
                    </button>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
                  {accepted.length} accepted
                </span>
                {suggestions.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="font-mono text-2xs uppercase tracking-[0.16em] text-muted underline decoration-1 underline-offset-2 transition-colors duration-fast ease-out-quart hover:text-ink"
                  >
                    Start over
                  </button>
                ) : null}
              </div>
            </footer>

            {confirmClose ? (
              <div
                role="alertdialog"
                aria-label="Close confirmation"
                className="absolute inset-0 z-10 flex items-center justify-center bg-bg/70 px-6 backdrop-blur-[2px]"
              >
                <div className="flex w-full max-w-[300px] flex-col gap-2.5 rounded-md border border-border bg-bg p-4 shadow-modal">
                  <p className="font-display text-md font-medium text-ink">Close this panel?</p>
                  <p className="font-sans text-sm text-ink-soft text-pretty">
                    Your suggestions are kept — reopen them anytime from the Tailor button in the
                    top bar.
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      autoFocus
                      onClick={() => setConfirmClose(false)}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-sm bg-ink px-3 font-sans text-sm font-medium text-bg transition-colors duration-fast ease-out-quart hover:bg-accent focus-visible:outline-none"
                    >
                      Keep reviewing
                    </button>
                    <button
                      type="button"
                      onClick={confirmedClose}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-sm border border-border bg-bg px-3 font-sans text-sm font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink focus-visible:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </m.aside>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default TailorDrawer;
