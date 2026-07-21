"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { SendHorizontal, Square, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ChatStreamEvent } from "@/types/chat";

const STORAGE_KEY = "ppt-chat-transcript";
const MAX_TEXTAREA_HEIGHT_PX = 140;
const MAX_MESSAGE_LENGTH = 4000;

const SUGGESTIONS = [
  "What's the best rig for 1440p gaming?",
  "How does the Custom PC Builder work?",
  "What cooler size should I get?",
];

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Minimal, dependency-free Markdown styling for chat bubbles. */
function MarkdownBubble({ content }: { content: string }) {
  return (
    <div className="chat-markdown text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * The heavy part of the chat widget (message list, Markdown rendering,
 * streaming fetch logic) — lazy-loaded by ChatWidget only once the visitor
 * actually opens the chat, so react-markdown/remark-gfm never ship in the
 * initial page load.
 */
export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Restore this browser tab's transcript (no accounts on this site, so
  // history is session-only, same spirit as the guest chat it's adapted from).
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored) as ChatMessage[]);
    } catch {
      // unavailable or corrupt — start empty
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // best effort only
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingText]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [text]);

  const trimmed = text.trim();
  const canSend = !isGenerating && trimmed.length > 0;

  const send = async (message?: string) => {
    const content = (message ?? trimmed).trim();
    if (!content || isGenerating) return;
    setErrorBanner(null);
    setIsGenerating(true);
    setText("");

    const userMessage: ChatMessage = {
      id: newId("user"),
      role: "user",
      content,
      status: "completed",
    };
    const transcript = [...messages, userMessage];
    setMessages(transcript);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: transcript.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        setErrorBanner(body?.error ?? "Could not send the message. Please try again.");
        return;
      }

      setStreamingText("");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processEvent = (event: ChatStreamEvent) => {
        if (event.type === "delta") {
          assistantText += event.text;
          setStreamingText(assistantText);
        } else if (event.type === "done") {
          setStreamingText(null);
          setMessages((prev) => [
            ...prev,
            { id: newId("assistant"), role: "assistant", content: assistantText, status: "completed" },
          ]);
        } else if (event.type === "error") {
          setStreamingText(null);
          if (assistantText) {
            setMessages((prev) => [
              ...prev,
              { id: newId("assistant"), role: "assistant", content: assistantText, status: "completed" },
            ]);
          }
          setErrorBanner(event.message);
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            processEvent(JSON.parse(line) as ChatStreamEvent);
          } catch {
            // ignore malformed stream fragments
          }
        }
      }
    } catch (error) {
      setStreamingText(null);
      const wasAborted =
        controller.signal.aborted || (error instanceof Error && error.name === "AbortError");
      if (wasAborted) {
        if (assistantText) {
          setMessages((prev) => [
            ...prev,
            { id: newId("assistant"), role: "assistant", content: assistantText, status: "completed" },
          ]);
        }
      } else {
        setErrorBanner("Connection lost while generating. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    void send();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="PixelPulse Assistant chat"
      className={`fixed z-[65] bottom-24 right-5 flex flex-col overflow-hidden rounded-2xl border border-red-900/40 bg-[#0c0707] shadow-2xl
        w-[min(23rem,calc(100vw-2.5rem))] h-[min(34rem,calc(100dvh-8rem))]
        ${prefersReducedMotion ? "" : "animate-[chatIn_0.22s_ease-out]"}`}
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#1a0a0a] to-[#0c0707] px-4 py-3">
        <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-tight truncate">PixelPulse Assistant</p>
          <p className="text-[11px] text-white/45 font-mono tracking-wide">Ask about rigs & builds</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="glow-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60"
        >
          <X className="size-4" />
        </button>
      </div>

          {/* messages */}
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.length === 0 && streamingText === null && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
                  Hey! I'm the PixelPulse Assistant. Ask me about our rigs, parts,
                  or the Custom PC Builder — I'm happy to help you find the right build.
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="glow-link text-left text-xs text-red-300 border border-red-900/40 rounded-lg px-3 py-2 bg-red-950/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                  message.role === "user"
                    ? "self-end bg-red-600 text-white"
                    : "self-start bg-white/[0.06] text-white/90"
                }`}
              >
                {message.role === "assistant" ? (
                  <MarkdownBubble content={message.content} />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            ))}

            {streamingText !== null && (
              <div className="self-start max-w-[85%] rounded-xl px-3.5 py-2.5 bg-white/[0.06] text-white/90">
                <MarkdownBubble content={streamingText || "…"} />
              </div>
            )}

            {errorBanner && (
              <div className="self-center text-center text-xs text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                {errorBanner}
              </div>
            )}
          </div>

          {/* composer */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 p-2.5">
            <div className="flex items-end gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 focus-within:border-red-600/50">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Ask anything… (Enter to send)"
                aria-label="Message"
                className="max-h-[140px] min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Stop generating"
                  className="glow-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                >
                  <Square className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send message"
                  className="glow-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white disabled:opacity-40 disabled:pointer-events-none"
                >
                  <SendHorizontal className="size-4" />
                </button>
              )}
            </div>
          </form>
    </div>
  );
}
