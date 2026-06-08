export const stripMarkdown = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1');
};
