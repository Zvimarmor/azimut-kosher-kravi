import React from 'react';

interface FormattedContentProps {
  content: string | null;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
    if (!content) return null;

    const isStructured = content.includes('\\n') && content.length > 300;

    if (!isStructured) {
        return <p className="whitespace-pre-wrap leading-relaxed text-light-sand">{content}</p>;
    }

    const lines = content.split('\\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
        const isSubtitle = line.length < 50 && !line.endsWith('.') && !line.endsWith(':') && index < lines.length - 1;

        if (isSubtitle) {
            return <h3 key={index} className="text-lg font-bold text-light-sand mt-6 mb-2">{line}</h3>;
        }
        return <p key={index} className="whitespace-pre-wrap leading-relaxed text-light-sand mb-4">{line}</p>;
    });
};

export default FormattedContent;