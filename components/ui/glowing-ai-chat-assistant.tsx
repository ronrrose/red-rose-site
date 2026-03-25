"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Link as LinkIcon, Code, Mic, Send, Info, Bot, X, Loader2 } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const FloatingAiAssistant: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm the Red Rose AI assistant. How can I help?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, maxChars);
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setMessage("");
    setCharCount(0);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong on my side." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        chatRef.current &&
        !chatRef.current.contains(target) &&
        !target.closest(".floating-ai-button")
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className={`floating-ai-button relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-500 border-2 border-white/20 shadow-chat-btn transition-all duration-500 ${
          isChatOpen ? "rotate-90" : "rotate-0"
        }`}
        onClick={() => setIsChatOpen((v) => !v)}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="relative z-10">
          {isChatOpen ? <X className="h-8 w-8 text-white" /> : <Bot className="h-8 w-8 text-white" />}
        </div>
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-20" />
      </button>

      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[90vw] max-w-[500px] origin-bottom-right animate-chat-pop-in"
        >
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-zinc-800/60 px-2 py-1 text-xs font-medium text-zinc-300">
                  GPT-4
                </span>
                <span className="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-400">
                  Pro
                </span>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-zinc-700/50"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto px-6 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-700 text-white"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative overflow-hidden">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={isLoading}
                className="min-h-[80px] w-full resize-none border-none bg-transparent px-6 py-4 text-base font-normal leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500 disabled:opacity-50"
                placeholder="Ask me anything about Red Rose Technologies..."
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/10 to-transparent" />
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-1">
                    <button className="group rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:bg-zinc-800/80 hover:text-zinc-200">
                      <Paperclip className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                    <button className="group rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:bg-zinc-800/80 hover:text-brand-400">
                      <LinkIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                    <button className="group rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:bg-zinc-800/80 hover:text-zinc-200">
                      <Code className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </button>
                  </div>

                  <button className="group rounded-lg border border-zinc-700/30 bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:bg-zinc-800/80 hover:text-brand-400 hover:border-brand-500/30">
                    <Mic className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-zinc-500">
                    <span>{charCount}</span>
                    <span className="text-zinc-400">/{maxChars}</span>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={isLoading || !message.trim()}
                    className="group rounded-xl bg-brand-700 hover:bg-brand-600 p-3 text-white shadow-chat-send transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-6 border-t border-zinc-800/50 pt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  <span>
                    Press{" "}
                    <kbd className="inline-flex items-center rounded border border-zinc-600 bg-zinc-800 px-1.5 py-1 font-mono text-xs text-zinc-400 shadow-sm">
                      Shift + Enter
                    </kbd>{" "}
                    for new line
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
