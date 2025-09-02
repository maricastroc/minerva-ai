'use client';

import { useCallback, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return !inline ? (
    <div className="relative my-2">
      <div className="flex justify-between items-center bg-gray-700 px-4 py-1 rounded-t-md">
        <span className="text-xs text-gray-300">
          {match ? match[1] : 'code'}
        </span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-gray-300 hover:text-white transition-colors"
          title="Copiar código"
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <code
        className={className}
        style={{
          display: 'block',
          padding: '1rem',
          background: '#2d2d2d',
          borderRadius: '0 0 0.5rem 0.5rem',
          overflowX: 'auto',
        }}
        {...props}
      >
        {children}
      </code>
    </div>
  ) : (
    <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
      {children}
    </code>
  );
};

const CustomListItem = ({ node, children, ordered, index, ...props }: any) => {
  return (
    <li className="flex items-start mb-2" {...props}>
      {ordered ? (
        <span className="mr-2 mt-0.5 flex-shrink-0 text-sm">{index + 1}.</span>
      ) : (
        <span className="mr-2 mt-0.5 flex-shrink-0">•</span>
      )}
      <span className="flex-1">{children}</span>
    </li>
  );
};

export const MarkdownRenderer = ({ content }: { content: string }) => {
  const cleanContent = useCallback((text: string) => {
    return text.replace(/(\n\s*){3,}/g, '\n\n').trim();
  }, []);

  const components: Components = {
    code: CodeBlock,
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-bold mb-3 mt-5" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-bold mb-2 mt-4" {...props} />
    ),
    p: ({ node, ...props }) => {
      if (
        !props.children ||
        (typeof props.children === 'string' && props.children.trim() === '')
      ) {
        return null;
      }
      return <p className="mb-4 leading-relaxed" {...props} />;
    },
    ul: ({ node, ...props }) => (
      <ul className="mb-4 mt-2 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="mb-4 mt-2 space-y-1" {...props} />
    ),
    li: ({ node, ...props }) => <CustomListItem node={node} {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-400 pl-4 my-4 italic text-gray-300"
        {...props}
      />
    ),
    a: ({ node, ...props }) => (
      <a
        className="text-blue-400 hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
    em: ({ node, ...props }) => <em className="italic" {...props} />,
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-5">
        <table className="min-w-full border-collapse" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="border border-gray-600 px-3 py-2 bg-gray-700 font-bold"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-600 px-3 py-2" {...props} />
    ),
    br: ({ node, ...props }) => <br {...props} className="block h-3" />,
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown components={components}>
        {cleanContent(content)}
      </ReactMarkdown>
    </div>
  );
};
