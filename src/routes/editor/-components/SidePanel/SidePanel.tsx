import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LeftToRightListBulletIcon,
  DashboardSquare01Icon,
  TextFontIcon,
  Download04Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import SectionsTab from '../SectionsTab/SectionsTab';
import TemplateTab from '../TemplateTab/TemplateTab';
import ThemeTab from '../ThemeTab/ThemeTab';
import ExportTab from '../ExportTab/ExportTab';
import type { EditorTab } from '@/types/editor-tab-type';
import type { IconSvgElement } from '@hugeicons/react';

interface ISidePanelProps {
  activeTab: EditorTab;
  onChangeTab: (tab: EditorTab) => void;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onDownloadJson: () => void;
  onAtsCheck: () => void;
  pdfBusy?: boolean;
  docxBusy?: boolean;
  atsBusy?: boolean;
}

interface ITabConfig {
  value: EditorTab;
  label: string;
  icon: IconSvgElement;
}

const tabs: ITabConfig[] = [
  { value: 'sections', label: 'Sections', icon: LeftToRightListBulletIcon },
  { value: 'template', label: 'Template', icon: DashboardSquare01Icon },
  { value: 'theme', label: 'Theme', icon: TextFontIcon },
  { value: 'export', label: 'Export', icon: Download04Icon },
];

const SidePanel: FC<ISidePanelProps> = ({
  activeTab,
  onChangeTab,
  onDownloadPdf,
  onDownloadDocx,
  onDownloadJson,
  onAtsCheck,
  pdfBusy,
  docxBusy,
  atsBusy,
}) => {
  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-border bg-surface-sunk/40 sm:w-[360px]">
      <nav
        role="tablist"
        aria-label="Editor sections"
        className="flex border-b border-border bg-bg/60"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${tab.value}`}
              type="button"
              onClick={() => onChangeTab(tab.value)}
              className={cn(
                'group relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors duration-fast ease-out-quart',
                active ? 'text-ink' : 'text-muted hover:text-ink-soft',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-pill bg-accent"
                />
              ) : null}
              <HugeiconsIcon icon={tab.icon} size={16} strokeWidth={1.5} />
              <span className="font-sans text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto scrollbar-slim">
        {activeTab === 'sections' ? <SectionsTab /> : null}
        {activeTab === 'template' ? <TemplateTab /> : null}
        {activeTab === 'theme' ? <ThemeTab /> : null}
        {activeTab === 'export' ? (
          <ExportTab
            onDownloadPdf={onDownloadPdf}
            onDownloadDocx={onDownloadDocx}
            onDownloadJson={onDownloadJson}
            onAtsCheck={onAtsCheck}
            pdfBusy={pdfBusy}
            docxBusy={docxBusy}
            atsBusy={atsBusy}
          />
        ) : null}
      </div>
    </aside>
  );
};

export default SidePanel;
