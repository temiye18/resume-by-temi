import { type FC, Fragment } from 'react';
import { Text, View, Link } from '@react-pdf/renderer';

interface IInlineToken {
  type: 'text' | 'bold' | 'italic' | 'link';
  value: string;
  href?: string;
}

const tokenizeInline = (input: string): IInlineToken[] => {
  const tokens: IInlineToken[] = [];
  let i = 0;
  let pending = '';
  const flush = () => {
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
        flush();
        tokens.push({ type: 'bold', value: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (input[i] === '*' && input[i + 1] !== ' ' && input[i + 1] !== '*') {
      const end = input.indexOf('*', i + 1);
      if (end !== -1 && input[end - 1] !== ' ') {
        flush();
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
          flush();
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
  flush();
  return tokens;
};

interface IBlock {
  kind: 'heading' | 'paragraph' | 'bullet' | 'ordered' | 'quote';
  level?: number;
  content: string;
  orderedIndex?: number;
}

const SOFT_BREAK = /\\\r?\n/g;
const ESCAPED_PREFIX = /^\\([#*\-+>[\]()_`])/;

const normalizeSource = (source: string): string => source.replace(SOFT_BREAK, '\n');

const splitBlocks = (source: string): IBlock[] => {
  const lines = normalizeSource(source).split(/\r?\n/);
  const blocks: IBlock[] = [];
  let paraBuffer: string[] = [];
  let orderedCounter = 0;

  const flushPara = () => {
    if (paraBuffer.length > 0) {
      blocks.push({ kind: 'paragraph', content: paraBuffer.join(' ') });
      paraBuffer = [];
    }
    orderedCounter = 0;
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
      if (paraBuffer.length) flushPara();
      blocks.push({ kind: 'bullet', content: bulletMatch[1] });
      continue;
    }
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (paraBuffer.length) flushPara();
      orderedCounter += 1;
      blocks.push({
        kind: 'ordered',
        content: orderedMatch[1],
        orderedIndex: orderedCounter,
      });
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

interface IInlineProps {
  tokens: IInlineToken[];
  accentColor: string;
}

const InlineRuns: FC<IInlineProps> = ({ tokens, accentColor }) => (
  <Fragment>
    {tokens.map((token, idx) => {
      switch (token.type) {
        case 'bold':
          return (
            <Text key={idx} style={{ fontWeight: 700 }}>
              {token.value}
            </Text>
          );
        case 'italic':
          return (
            <Text key={idx} style={{ fontStyle: 'italic' }}>
              {token.value}
            </Text>
          );
        case 'link':
          if (!isSafeHref(token.href)) {
            return <Text key={idx}>{token.value}</Text>;
          }
          return (
            <Link
              key={idx}
              src={token.href ?? ''}
              style={{ color: accentColor, textDecoration: 'none' }}
            >
              {token.value}
            </Link>
          );
        default:
          return <Text key={idx}>{token.value}</Text>;
      }
    })}
  </Fragment>
);

// react-pdf's Style is deeply-constrained; runtime accepts plain objects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfStyle = any;

interface IMarkdownBlocksPdfProps {
  source: string;
  baseStyle: PdfStyle;
  accentColor?: string;
}

const headingScale = (level: number): { fontSize: number; marginTop: number; marginBottom: number } => {
  if (level === 1) return { fontSize: 1.12, marginTop: 4, marginBottom: 2 };
  if (level === 2) return { fontSize: 1.06, marginTop: 3, marginBottom: 2 };
  return { fontSize: 1, marginTop: 2, marginBottom: 1 };
};

const MarkdownBlocksPdf: FC<IMarkdownBlocksPdfProps> = ({
  source,
  baseStyle,
  accentColor = '#111',
}) => {
  if (!source) return null;
  const blocks = splitBlocks(source);
  const baseFontSize = typeof baseStyle.fontSize === 'number' ? (baseStyle.fontSize as number) : 10;

  return (
    <View>
      {blocks.map((block, i) => {
        const tokens = tokenizeInline(block.content);
        if (block.kind === 'heading') {
          const scale = headingScale(block.level ?? 3);
          return (
            <Text
              key={i}
              style={{
                ...baseStyle,
                fontSize: baseFontSize * scale.fontSize,
                fontWeight: 700,
                marginTop: scale.marginTop,
                marginBottom: scale.marginBottom,
              }}
            >
              <InlineRuns tokens={tokens} accentColor={accentColor} />
            </Text>
          );
        }
        if (block.kind === 'bullet') {
          return (
            <View
              key={i}
              style={{ flexDirection: 'row', marginTop: 1, paddingLeft: 10 }}
            >
              <Text style={baseStyle}>{'• '}</Text>
              <Text style={{ ...baseStyle, flex: 1 }}>
                <InlineRuns tokens={tokens} accentColor={accentColor} />
              </Text>
            </View>
          );
        }
        if (block.kind === 'ordered') {
          return (
            <View
              key={i}
              style={{ flexDirection: 'row', marginTop: 1, paddingLeft: 10 }}
            >
              <Text style={baseStyle}>{`${block.orderedIndex ?? i + 1}. `}</Text>
              <Text style={{ ...baseStyle, flex: 1 }}>
                <InlineRuns tokens={tokens} accentColor={accentColor} />
              </Text>
            </View>
          );
        }
        if (block.kind === 'quote') {
          return (
            <View
              key={i}
              style={{
                marginTop: 2,
                marginBottom: 2,
                paddingLeft: 6,
                borderLeftWidth: 1,
                borderLeftColor: '#999',
                borderLeftStyle: 'solid',
              }}
            >
              <Text style={{ ...baseStyle, fontStyle: 'italic' }}>
                <InlineRuns tokens={tokens} accentColor={accentColor} />
              </Text>
            </View>
          );
        }
        return (
          <Text key={i} style={baseStyle}>
            <InlineRuns tokens={tokens} accentColor={accentColor} />
          </Text>
        );
      })}
    </View>
  );
};

export default MarkdownBlocksPdf;
