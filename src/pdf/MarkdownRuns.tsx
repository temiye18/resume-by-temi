import { type FC, Fragment } from 'react';
import { Text, Link } from '@react-pdf/renderer';

interface IInlineToken {
  type: 'text' | 'bold' | 'italic' | 'link';
  value: string;
  href?: string;
}

const tokenize = (input: string): IInlineToken[] => {
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

interface IMarkdownRunsProps {
  source: string;
  accentColor?: string;
}

const MarkdownRuns: FC<IMarkdownRunsProps> = ({ source, accentColor = '#111' }) => {
  if (!source) return null;
  const tokens = tokenize(source);
  return (
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
          case 'text':
          default:
            return <Text key={idx}>{token.value}</Text>;
        }
      })}
    </Fragment>
  );
};

export default MarkdownRuns;
