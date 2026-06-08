import { type FC, type ReactNode, Fragment } from 'react';

interface IMarkdownTextProps {
  source: string;
  className?: string;
  blocks?: boolean;
}

interface IInlineToken {
  type: 'text' | 'bold' | 'italic' | 'link';
  value: string;
  href?: string;
}

const tokenizeInline = (raw: string): IInlineToken[] => {
  // Collapse stray newlines to single space so they don't render as literal characters.
  const input = raw.replace(/\s*\n+\s*/g, ' ');
  const tokens: IInlineToken[] = [];
  let i = 0;
  let pending = '';
  const flushText = () => {
    if (pending) {
      tokens.push({ type: 'text', value: pending });
      pending = '';
    }
  };

  while (i < input.length) {
    if (input[i] === '\\' && i + 1 < input.length) {
      pending += input[i + 1];
      i += 2;
      continue;
    }

    if (input.startsWith('**', i)) {
      const end = input.indexOf('**', i + 2);
      if (end !== -1) {
        flushText();
        tokens.push({ type: 'bold', value: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === '*' && input[i + 1] !== ' ' && input[i + 1] !== '*') {
      const end = input.indexOf('*', i + 1);
      if (end !== -1 && input[end - 1] !== ' ') {
        flushText();
        tokens.push({ type: 'italic', value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (input[i] === '[') {
      const closeBracket = input.indexOf(']', i + 1);
      if (closeBracket !== -1 && input[closeBracket + 1] === '(') {
        const closeParen = input.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          flushText();
          tokens.push({
            type: 'link',
            value: input.slice(i + 1, closeBracket),
            href: input.slice(closeBracket + 2, closeParen),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    pending += input[i];
    i += 1;
  }
  flushText();
  return tokens;
};

const SAFE_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

const isSafeHref = (href?: string): boolean => {
  if (!href) return false;
  try {
    const u = new URL(href, 'http://_');
    return SAFE_LINK_SCHEMES.has(u.protocol);
  } catch {
    return false;
  }
};

const renderInline = (tokens: IInlineToken[], keyPrefix = ''): ReactNode => {
  return tokens.map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (token.type) {
      case 'bold':
        return (
          <strong key={key} className="font-semibold">
            {token.value}
          </strong>
        );
      case 'italic':
        return (
          <em key={key} className="italic">
            {token.value}
          </em>
        );
      case 'link':
        if (!isSafeHref(token.href)) {
          return <Fragment key={key}>{token.value}</Fragment>;
        }
        return (
          <a
            key={key}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent no-underline hover:underline"
          >
            {token.value}
          </a>
        );
      case 'text':
      default:
        return <Fragment key={key}>{token.value}</Fragment>;
    }
  });
};

interface IBlock {
  kind: 'heading' | 'paragraph' | 'bullet' | 'ordered' | 'quote';
  level?: number;
  content: string;
}

const SOFT_BREAK = /\\\r?\n/g;
const ESCAPED_PREFIX = /^\\([#*\-+>[\]()_`])/;

const normalizeSource = (source: string): string => {
  return source.replace(SOFT_BREAK, '\n');
};

const splitBlocks = (source: string): IBlock[] => {
  const lines = normalizeSource(source).split(/\r?\n/);
  const blocks: IBlock[] = [];
  let paraBuffer: string[] = [];

  const flushPara = () => {
    if (paraBuffer.length > 0) {
      blocks.push({ kind: 'paragraph', content: paraBuffer.join(' ') });
      paraBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd().replace(ESCAPED_PREFIX, '$1');
    if (!line.trim()) {
      flushPara();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushPara();
      blocks.push({
        kind: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      continue;
    }

    const bulletMatch = line.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      flushPara();
      blocks.push({ kind: 'bullet', content: bulletMatch[1] });
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushPara();
      blocks.push({ kind: 'ordered', content: orderedMatch[1] });
      continue;
    }

    if (line.startsWith('> ')) {
      flushPara();
      blocks.push({ kind: 'quote', content: line.slice(2) });
      continue;
    }

    paraBuffer.push(line);
  }
  flushPara();
  return blocks;
};

const headingClass = (level: number): string => {
  if (level === 1) return 'block text-[1.06em] font-semibold leading-snug mt-2 mb-1';
  if (level === 2) return 'block text-[1em] font-semibold leading-snug mt-2 mb-1';
  return 'block text-[0.96em] font-semibold leading-snug mt-2 mb-1';
};

const paragraphClass = (first: boolean): string =>
  first ? 'block' : 'block mt-1.5';

const renderBlocks = (blocks: IBlock[]): ReactNode => {
  const result: ReactNode[] = [];
  let listBuffer: { items: string[]; ordered: boolean } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const ordered = listBuffer.ordered;
    const items = listBuffer.items;
    const Tag: 'ul' | 'ol' = ordered ? 'ol' : 'ul';
    result.push(
      <Tag
        key={`list-${result.length}`}
        className={ordered ? 'list-decimal pl-5 my-1' : 'list-disc pl-5 my-1'}
      >
        {items.map((item, i) => (
          <li key={i}>{renderInline(tokenizeInline(item), `li-${i}`)}</li>
        ))}
      </Tag>,
    );
    listBuffer = null;
  };

  blocks.forEach((block, idx) => {
    if (block.kind === 'bullet' || block.kind === 'ordered') {
      const ordered = block.kind === 'ordered';
      if (!listBuffer || listBuffer.ordered !== ordered) {
        flushList();
        listBuffer = { items: [block.content], ordered };
      } else {
        listBuffer.items.push(block.content);
      }
      return;
    }
    flushList();

    if (block.kind === 'heading') {
      const level = block.level ?? 3;
      result.push(
        <span key={`b-${idx}`} className={headingClass(level)}>
          {renderInline(tokenizeInline(block.content), `h-${idx}`)}
        </span>,
      );
      return;
    }

    if (block.kind === 'quote') {
      result.push(
        <span
          key={`b-${idx}`}
          className="block border-l-2 border-resume-rule pl-2 my-1 italic"
        >
          {renderInline(tokenizeInline(block.content), `q-${idx}`)}
        </span>,
      );
      return;
    }

    result.push(
      <span key={`b-${idx}`} className={paragraphClass(result.length === 0)}>
        {renderInline(tokenizeInline(block.content), `p-${idx}`)}
      </span>,
    );
  });
  flushList();

  return result;
};

const MarkdownText: FC<IMarkdownTextProps> = ({ source, className, blocks }) => {
  if (!source) return null;
  if (blocks) {
    const parsed = splitBlocks(source);
    if (className) return <span className={className}>{renderBlocks(parsed)}</span>;
    return <>{renderBlocks(parsed)}</>;
  }
  const tokens = tokenizeInline(source);
  if (className) return <span className={className}>{renderInline(tokens)}</span>;
  return <>{renderInline(tokens)}</>;
};

export default MarkdownText;
