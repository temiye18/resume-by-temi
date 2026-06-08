import { type FC } from 'react';
import SectionsTab from '../SectionsTab/SectionsTab';
import TemplateTab from '../TemplateTab/TemplateTab';
import ThemeTab from '../ThemeTab/ThemeTab';
import ExportTab from '../ExportTab/ExportTab';
import type { EditorTab } from '@/types/editor-tab-type';

interface IEditorTabContentProps {
  activeTab: EditorTab;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onDownloadJson: () => void;
  onAtsCheck: () => void;
  jobDescription: string;
  onChangeJobDescription: (next: string) => void;
  pdfBusy?: boolean;
  docxBusy?: boolean;
  atsBusy?: boolean;
}

const EditorTabContent: FC<IEditorTabContentProps> = ({
  activeTab,
  onDownloadPdf,
  onDownloadDocx,
  onDownloadJson,
  onAtsCheck,
  jobDescription,
  onChangeJobDescription,
  pdfBusy,
  docxBusy,
  atsBusy,
}) => {
  if (activeTab === 'sections') return <SectionsTab />;
  if (activeTab === 'template') return <TemplateTab />;
  if (activeTab === 'theme') return <ThemeTab />;
  if (activeTab === 'export') {
    return (
      <ExportTab
        onDownloadPdf={onDownloadPdf}
        onDownloadDocx={onDownloadDocx}
        onDownloadJson={onDownloadJson}
        onAtsCheck={onAtsCheck}
        jobDescription={jobDescription}
        onChangeJobDescription={onChangeJobDescription}
        pdfBusy={pdfBusy}
        docxBusy={docxBusy}
        atsBusy={atsBusy}
      />
    );
  }
  return null;
};

export default EditorTabContent;
