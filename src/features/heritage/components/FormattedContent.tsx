import React from 'react';

interface FormattedContentProps {
  content: string | null;
  isRTL?: boolean;
}

type ParsedBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'divider' };

function parseContent(raw: string): ParsedBlock[] {
  const lines = raw.split('\\n').map(l => l.trim()).filter(l => l !== '');
  const blocks: ParsedBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Markdown-style heading
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'heading', text: line.slice(3) });
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ kind: 'heading', text: line.slice(2) });
      continue;
    }
    // Markdown blockquote
    if (line.startsWith('> ')) {
      blocks.push({ kind: 'quote', text: line.slice(2) });
      continue;
    }
    // Separator / divider
    if (/^[-*_]{3,}$/.test(line)) {
      blocks.push({ kind: 'divider' });
      continue;
    }
    // Heuristic sub-heading: short line, no trailing period, not mid-list
    const isShort = line.length < 55;
    const noTrailingPeriod = !line.endsWith('.');
    const notMidText = i === 0 || blocks.length === 0 || blocks[blocks.length - 1].kind !== 'paragraph';
    if (isShort && noTrailingPeriod && notMidText && i < lines.length - 1) {
      blocks.push({ kind: 'subheading', text: line });
      continue;
    }

    blocks.push({ kind: 'paragraph', text: line });
  }

  return blocks;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content, isRTL = true }) => {
  if (!content) return null;

  const isStructured = content.includes('\\n') && content.length > 200;

  if (!isStructured) {
    return (
      <p className={`text-tactical-text/90 leading-[1.85] text-[0.95rem] whitespace-pre-wrap ${isRTL ? 'text-right' : 'text-left'}`}>
        {content}
      </p>
    );
  }

  const blocks = parseContent(content);

  return (
    <div className="space-y-0">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'heading':
            return (
              <h2
                key={i}
                className={`text-xl font-bold text-tactical-text mt-8 mb-3 first:mt-0 tracking-tight ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {block.text}
              </h2>
            );

          case 'subheading':
            return (
              <h3
                key={i}
                className={`text-base font-bold text-tactical-accent mt-6 mb-2 first:mt-0 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {block.text}
              </h3>
            );

          case 'quote':
            return (
              <blockquote
                key={i}
                className={`my-5 pl-4 border-l-2 border-tactical-accent/50 italic text-tactical-muted leading-relaxed text-sm ${isRTL ? 'border-r-2 border-l-0 pr-4 pl-0 text-right' : 'text-left'}`}
              >
                {block.text}
              </blockquote>
            );

          case 'divider':
            return (
              <div key={i} className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-tactical-accent/15" />
                <div className="w-1.5 h-1.5 rounded-full bg-tactical-accent/40" />
                <div className="flex-1 h-px bg-tactical-accent/15" />
              </div>
            );

          case 'paragraph':
          default:
            return (
              <p
                key={i}
                className={`text-tactical-text/88 leading-[1.9] text-[0.92rem] mb-4 whitespace-pre-wrap ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
};

export default FormattedContent;
