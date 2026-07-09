"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, SendHorizontal, Bot, User } from "lucide-react";
import type { AgentMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Why did Search Service latency spike on May 17?",
  "Summarize the current P1/P2 incidents.",
  "Which service is closest to breaching its SLO?",
  "What's driving the change failure rate up?",
];

export function AgentChatPanel({
  open,
  onClose,
  pendingQuestion,
}: {
  open: boolean;
  onClose: () => void;
  /** A question pushed in from elsewhere (e.g. an insight card). */
  pendingQuestion?: { text: string; nonce: number };
}) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastNonce = useRef<number>(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Fire an externally-supplied question once when it changes.
  useEffect(() => {
    if (pendingQuestion && pendingQuestion.nonce !== lastNonce.current) {
      lastNonce.current = pendingQuestion.nonce;
      void send(pendingQuestion.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    const next: AgentMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Placeholder assistant message we stream tokens into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "⚠️ The agent backend isn't reachable. Check that the dev server is running and that Azure OpenAI is configured in .env.local.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l border-panel-border bg-bg-soft shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-panel-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-blue/20 text-brand-blue">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-bold text-ink">SRE Agent</div>
              <div className="text-[10.5px] text-ink-muted">Diagnosis · Triage · Summaries</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-[12px] text-ink-muted">
                Ask about incidents, SLO risk, latency, or error spikes. The agent reasons over live
                telemetry and returns a plain-English answer with the relevant chart.
              </p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-panel-border bg-panel px-3 py-2 text-left text-[12px] text-ink transition-colors hover:border-brand-blue/60 hover:bg-panel-hover"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
                  m.role === "user" ? "bg-panel-hover text-ink" : "bg-brand-blue/20 text-brand-blue"
                }`}
              >
                {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </span>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[12.5px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-blue text-white"
                    : "border border-panel-border bg-panel text-ink"
                }`}
              >
                {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-panel-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the SRE agent…"
            className="flex-1 rounded-lg border border-panel-border bg-panel px-3 py-2 text-[12.5px] text-ink outline-none placeholder:text-ink-faint focus:border-brand-blue/60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </>
  );
}
