import { isValidElement, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiChatCodeBlock = lazy(() => import('./AiChatCodeBlock.jsx'));

function TypingIndicator() {
  return (
    <span aria-label="AI is typing" className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((dot) => (
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-cyan-500"
          key={dot}
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </span>
  );
}

function MarkdownCode({ children }) {
  return (
    <code className="rounded-md bg-slate-200 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
      {children}
    </code>
  );
}

function MarkdownPre({ children }) {
  const codeElement = Array.isArray(children) ? children[0] : children;

  if (!isValidElement(codeElement)) {
    return <pre>{children}</pre>;
  }

  const languageMatch = /language-([\w-]+)/.exec(codeElement.props.className || '');
  const code = String(codeElement.props.children).replace(/\n$/, '');

  return (
    <Suspense
      fallback={(
        <pre className="my-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
          <code>{code}</code>
        </pre>
      )}
    >
      <AiChatCodeBlock code={code} language={languageMatch?.[1]} />
    </Suspense>
  );
}

const markdownComponents = {
  a: ({ children, href }) => (
    <a className="font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300" href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-cyan-500 pl-4 italic text-slate-600 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  code: MarkdownCode,
  h1: ({ children }) => <h4 className="mb-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{children}</h4>,
  h2: ({ children }) => <h5 className="mb-3 text-lg font-semibold text-slate-950 dark:text-white">{children}</h5>,
  h3: ({ children }) => <h6 className="mb-2 text-base font-semibold text-slate-950 dark:text-white">{children}</h6>,
  li: ({ children }) => <li className="mb-1.5">{children}</li>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  pre: MarkdownPre,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
};

function AiChatMessage({ message, showTyping }) {
  const isUser = message.role === 'user';

  return (
    <article className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-xs font-bold text-slate-950 shadow-sm">
          AI
        </div>
      ) : null}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] ${
          isUser
            ? 'rounded-br-md bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950'
            : 'rounded-bl-md border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : showTyping ? (
          <TypingIndicator />
        ) : (
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </article>
  );
}

export default AiChatMessage;
