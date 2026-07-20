import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth.js';
import useRequestLifecycle from '../hooks/useRequestLifecycle.js';
import { sendAiChat } from '../services/aiService.js';
import { isRequestCanceled } from '../utils/apiError.js';
import AiChatMessage from './AiChatMessage.jsx';

const MAX_HISTORY_ITEMS = 12;
const MAX_MESSAGE_LENGTH = 6000;
const MAX_HISTORY_CHARACTERS = 12000;

const createMessageId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getChatStorageKey = (userId) => `lifeos_lite_ai_chat_${userId || 'anonymous'}`;

const getStoredMessages = (storageKey) => {
  try {
    const savedMessages = window.sessionStorage.getItem(storageKey);
    const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];

    if (!Array.isArray(parsedMessages)) {
      return [];
    }

    return parsedMessages
      .filter(
        (message) =>
          message &&
          ['user', 'assistant'].includes(message.role) &&
          typeof message.content === 'string' &&
          message.content.trim(),
      )
      .slice(-MAX_HISTORY_ITEMS)
      .map((message) => ({
        id: createMessageId(),
        role: message.role,
        content: message.content.slice(0, MAX_MESSAGE_LENGTH),
      }));
  } catch {
    return [];
  }
};

const buildRequestHistory = (messages) => {
  const history = [];
  let totalCharacters = 0;

  for (let index = messages.length - 1; index >= 0 && history.length < MAX_HISTORY_ITEMS; index -= 1) {
    const message = messages[index];

    if (!message.content || message.isAnimating) {
      continue;
    }

    const content = message.content.slice(0, MAX_MESSAGE_LENGTH);

    if (totalCharacters + content.length > MAX_HISTORY_CHARACTERS) {
      continue;
    }

    history.unshift({ content, role: message.role });
    totalCharacters += content.length;
  }

  return history;
};

const getApiErrorMessage = (error) =>
  error.response?.data?.message || 'The AI reply could not be generated. Please try again.';

function AskAnythingChat() {
  const { user } = useAuth();
  const storageKey = getChatStorageKey(user?.id);
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState(() => getStoredMessages(storageKey));
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingResolverRef = useRef(null);
  const { createRequestSignal, isMounted } = useRequestLifecycle();

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify(messages.map(({ role, content }) => ({ role, content }))),
      );
    } catch {
      return undefined;
    }
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isSending, isTyping, messages]);

  useEffect(
    () => () => {
      window.clearTimeout(typingTimerRef.current);
      typingResolverRef.current?.();
    },
    [],
  );

  const animateAssistantResponse = (messageId, content) =>
    new Promise((resolve) => {
      const chunkSize = Math.max(12, Math.ceil(content.length / 80));
      let cursor = 0;

      const finish = () => {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
        typingResolverRef.current = null;

        if (isMounted()) {
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === messageId ? { ...message, content, isAnimating: false } : message,
            ),
          );
          setIsTyping(false);
        }

        resolve();
      };

      const typeNextChunk = () => {
        if (!isMounted()) {
          finish();
          return;
        }

        cursor = Math.min(cursor + chunkSize, content.length);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId
              ? { ...message, content: content.slice(0, cursor), isAnimating: cursor < content.length }
              : message,
          ),
        );

        if (cursor >= content.length) {
          finish();
          return;
        }

        typingTimerRef.current = window.setTimeout(typeNextChunk, 16);
      };

      typingResolverRef.current = finish;
      typeNextChunk();
    });

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || isSending) {
      return;
    }

    const history = buildRequestHistory(messages);
    const userMessage = { id: createMessageId(), role: 'user', content: message };
    const signal = createRequestSignal();

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setErrorMessage('');
    setIsSending(true);

    try {
      const response = await sendAiChat({ history, message }, { signal });

      if (!isMounted()) {
        return;
      }

      const assistantMessageId = createMessageId();
      const content = response.data?.content?.trim();

      if (!content) {
        throw new Error('The AI returned an empty response.');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: assistantMessageId, role: 'assistant', content: '', isAnimating: true },
      ]);
      setIsTyping(true);
      await animateAssistantResponse(assistantMessageId, content);
    } catch (error) {
      if (isMounted() && !isRequestCanceled(error)) {
        setErrorMessage(getApiErrorMessage(error));
      }
    } finally {
      if (isMounted()) {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const clearChat = () => {
    if (isSending) {
      return;
    }

    setMessages([]);
    setErrorMessage('');

    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      return;
    }
  };

  return (
    <section aria-labelledby="ask-anything-title" className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Gemini-powered chat</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white" id="ask-anything-title">Ask Anything AI</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Ask about your studies, programming, mathematics, science, careers, or any topic you want to explore.</p>
        </div>
        <button className="secondary-button justify-center" disabled={isSending || messages.length === 0} onClick={clearChat} type="button">
          Clear chat
        </button>
      </div>

      <div className="mt-6 min-h-[280px] rounded-[1.5rem] bg-slate-100/70 p-3 dark:bg-slate-950/50 sm:p-5">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">
              <span className="rounded-2xl bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-700 dark:text-cyan-300">AI</span>
              <h4 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">Start a thoughtful conversation</h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Try “Explain recursion with a JavaScript example” or “Help me plan a focused revision session.”</p>
            </div>
          ) : (
            messages.map((message) => (
              <AiChatMessage key={message.id} message={message} showTyping={message.isAnimating && !message.content} />
            ))
          )}
          {isSending && !isTyping ? (
            <div aria-live="polite" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
              Contacting Gemini...
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {errorMessage ? (
        <p aria-live="polite" className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-700 dark:text-rose-200" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5">
        <label className="sr-only" htmlFor="ai-chat-message">Ask anything</label>
        <textarea
          className="form-input min-h-28 resize-y pr-4"
          disabled={isSending}
          id="ai-chat-message"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          value={input}
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">Press Enter to send. Use Shift + Enter for a new line. {input.length}/{MAX_MESSAGE_LENGTH}</p>
          <button className="primary-button justify-center" disabled={!input.trim() || isSending} onClick={() => void sendMessage()} type="button">
            {isSending ? 'Thinking...' : 'Send message'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default AskAnythingChat;
