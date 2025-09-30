import React from 'react';

/**
 * Simple markdown renderer for chat messages
 * Handles basic formatting: ## headers and **bold** text
 */
export const renderMarkdown = (text: string): React.JSX.Element => {
  // Split text by lines to handle headers properly
  const lines = text.split('\n');
  const elements: React.JSX.Element[] = [];

  lines.forEach((line, lineIndex) => {
    if (line.trim() === '') {
      // Empty line - add line break
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // Check if line is a header (starts with ##)
    if (line.trim().startsWith('##')) {
      const headerText = line.replace(/^#+\s*/, '').trim();
      elements.push(
        <h3 key={`header-${lineIndex}`} className="text-lg font-bold mt-4 mb-2 text-right">
          {headerText}
        </h3>
      );
      return;
    }

    // Process bold text within the line
    const processedLine = processBoldText(line);
    elements.push(
      <p key={`line-${lineIndex}`} className="mb-2 text-right">
        {processedLine}
      </p>
    );
  });

  return <div className="whitespace-pre-wrap text-right">{elements}</div>;
};

/**
 * Process bold text markers (**text**) in a line
 */
const processBoldText = (text: string): React.JSX.Element[] => {
  const elements: React.JSX.Element[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/);

  parts.forEach((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text
      const boldText = part.slice(2, -2);
      elements.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {boldText}
        </strong>
      );
    } else if (part.trim() !== '') {
      // Regular text
      elements.push(<span key={`text-${index}`}>{part}</span>);
    }
  });

  return elements;
};