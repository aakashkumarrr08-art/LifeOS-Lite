import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function AiChatCodeBlock({ code, language }) {
  const [copyState, setCopyState] = useState('Copy code');

  useEffect(() => {
    if (copyState === 'Copy code') {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => setCopyState('Copy code'), 1800);
    return () => window.clearTimeout(resetTimer);
  }, [copyState]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('Copied');
    } catch {
      setCopyState('Copy failed');
    }
  };

  return (
    <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-inner">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-2.5">
        <span className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {language || 'text'}
        </span>
        <button
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          onClick={copyCode}
          type="button"
        >
          {copyState}
        </button>
      </div>
      <SyntaxHighlighter
        customStyle={{ background: 'transparent', margin: 0, maxWidth: '100%', overflowX: 'auto', padding: '1rem' }}
        language={language || 'text'}
        style={oneDark}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default AiChatCodeBlock;
