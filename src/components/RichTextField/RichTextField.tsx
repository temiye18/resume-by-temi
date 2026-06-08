import { type FC, useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Link01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';

interface IRichTextFieldProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  singleLine?: boolean;
  blockFormats?: boolean;
  className?: string;
  minHeight?: number;
  ariaLabel?: string;
}

const RichTextField: FC<IRichTextFieldProps> = ({
  value,
  onChange,
  placeholder,
  singleLine = false,
  blockFormats = false,
  className,
  minHeight,
  ariaLabel,
}) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: blockFormats ? { levels: [1, 2, 3] } : false,
        bulletList: blockFormats ? undefined : false,
        orderedList: blockFormats ? undefined : false,
        listItem: blockFormats ? undefined : false,
        blockquote: blockFormats ? undefined : false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Markdown.configure({
        html: false,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel ?? '',
        class: cn(
          'tiptap-prose outline-none',
          singleLine && 'whitespace-nowrap overflow-hidden',
        ),
      },
      handleKeyDown: (_view, event) => {
        if (singleLine && event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.storage.markdown.getMarkdown() as string;
      const cleaned = singleLine ? md.replace(/\n+/g, ' ').trim() : md;
      onChange(cleaned);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.storage.markdown.getMarkdown() as string;
    const incoming = value ?? '';
    if (current.trim() !== incoming.trim()) {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn(
          'rounded-sm border border-border bg-bg px-2.5 py-2 font-sans text-sm text-muted',
          className,
        )}
        style={{ minHeight }}
      >
        {placeholder ?? ''}
      </div>
    );
  }

  const commitLink = () => {
    const href = linkInput.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
    } else {
      const safeHref = /^https?:\/\//i.test(href) ? href : `https://${href}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: safeHref }).run();
    }
    setLinkOpen(false);
    setLinkInput('');
  };

  return (
    <div
      className={cn(
        'rounded-sm border border-border bg-bg transition-colors duration-fast ease-out-quart',
        'focus-within:border-accent',
        className,
      )}
      style={{ minHeight }}
    >
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120, placement: 'top' }}
        className="z-50"
      >
        <div className="flex items-center gap-0.5 rounded-sm border border-border bg-bg p-0.5 shadow-2">
          <BubbleButton
            label="Bold"
            icon={TextBoldIcon}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <BubbleButton
            label="Italic"
            icon={TextItalicIcon}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <BubbleButton
            label="Underline"
            icon={TextUnderlineIcon}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
          <BubbleButton
            label="Link"
            icon={Link01Icon}
            active={editor.isActive('link')}
            onClick={() => {
              setLinkInput((editor.getAttributes('link').href as string) ?? '');
              setLinkOpen(true);
            }}
          />
          {linkOpen ? (
            <div className="ml-1 flex items-center gap-1 border-l border-border pl-1">
              <input
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitLink();
                  if (e.key === 'Escape') {
                    setLinkOpen(false);
                    setLinkInput('');
                  }
                }}
                placeholder="https://"
                className="h-6 w-40 rounded-xs border border-border bg-bg px-1.5 font-sans text-xs text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={commitLink}
                className="inline-flex h-6 items-center rounded-xs bg-ink px-2 text-2xs font-medium text-bg hover:bg-accent transition-colors duration-fast ease-out-quart"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setLinkInput('');
                }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-xs text-muted hover:bg-surface hover:text-ink transition-colors duration-fast ease-out-quart"
                aria-label="Cancel"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={1.5} />
              </button>
            </div>
          ) : null}
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} className="px-2.5 py-2" />
    </div>
  );
};

interface IBubbleButtonProps {
  label: string;
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  active: boolean;
  onClick: () => void;
}

const BubbleButton: FC<IBubbleButtonProps> = ({ label, icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    className={cn(
      'inline-flex h-7 w-7 items-center justify-center rounded-xs transition-colors duration-fast ease-out-quart',
      active ? 'bg-accent text-accent-on' : 'text-ink-soft hover:bg-surface hover:text-ink',
    )}
  >
    <HugeiconsIcon icon={icon} size={13} strokeWidth={1.75} />
  </button>
);

export default RichTextField;
