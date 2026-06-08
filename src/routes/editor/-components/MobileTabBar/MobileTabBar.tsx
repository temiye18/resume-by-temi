import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LeftToRightListBulletIcon,
  EyeIcon,
  DashboardSquare01Icon,
  TextFontIcon,
  Download04Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import type { EditorTab } from '@/types/editor-tab-type';
import type { IconSvgElement } from '@hugeicons/react';

interface IMobileTabBarProps {
  activeTab: EditorTab;
  onChangeTab: (tab: EditorTab) => void;
}

interface ITabConfig {
  value: EditorTab;
  label: string;
  icon: IconSvgElement;
}

const tabs: ITabConfig[] = [
  { value: 'sections', label: 'Sections', icon: LeftToRightListBulletIcon },
  { value: 'preview', label: 'Preview', icon: EyeIcon },
  { value: 'template', label: 'Template', icon: DashboardSquare01Icon },
  { value: 'theme', label: 'Theme', icon: TextFontIcon },
  { value: 'export', label: 'Export', icon: Download04Icon },
];

const MobileTabBar: FC<IMobileTabBarProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav
      role="tablist"
      aria-label="Editor sections"
      className="flex shrink-0 border-t border-border bg-bg/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChangeTab(tab.value)}
            className={cn(
              'group relative flex flex-1 flex-col items-center gap-1 py-2.5 min-h-[56px] transition-colors duration-fast ease-out-quart',
              active ? 'text-ink' : 'text-muted active:text-ink-soft',
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-pill bg-accent"
              />
            ) : null}
            <HugeiconsIcon icon={tab.icon} size={18} strokeWidth={1.5} />
            <span className="font-sans text-[10px] font-medium leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
