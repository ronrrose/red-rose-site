"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Link as LinkIcon, Code, Mic, Send, Info, Bot, X } from "lucide-react";

const FloatingAiAssistant: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, maxChars);
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        className={`floating-ai-button relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ${
          isChatOpen ? "rotate-90" : "rotate-0"
        }`}
        onClick={() => setIsChatOpen((v) => !v)}
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)",
          boxShadow:
            "0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(124, 58, 237, 0.5), 0 0 60px rgba(109, 40, 217, 0.3)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30" />
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="relative z-10">
          {isChatOpen ? <X className="h-8 w-8 text-white" /> : <Bot className="h-8 w-8 text-white" />}
        </div>
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-20" />
      </button>

      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-max max-w-[500px] origin-bottom-right transition-all duration-300"
          style={{
            animation: "floatingAiPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-500/50 bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-zinc-800/60 px-2 py-1 text-xs font-medium text-zinc-300">
                  GPT-4
                </span>
                <span className="rounded-2xl border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
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

            <div className="relative overflow-hidden">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="min-h-[120px] w-full resize-none border-none bg-transparent px-6 py-4 text-base font-normal leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder="What would you like to explore today? Ask anything, share ideas, or request assistance..."
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-800/5 to-transparent"
                style={{
                  background:
                    "linear-gradient(to top, rgba(39, 39, 42, 0.05), transparent)",
                }}
              />
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-1">
                    <button className="group relative cursor-pointer rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:-rotate-3 hover:scale-105 hover:bg-zinc-800/80 hover:text-zinc-200">
                      <Paperclip className="h-4 w-4 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-125" />
                    </button>

                    <button className="group relative cursor-pointer rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:scale-105 hover:bg-zinc-800/80 hover:text-red-400 hover:rotate-6">
                      <LinkIcon className="h-4 w-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125" />
                    </button>

                    <button className="group relative cursor-pointer rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:scale-105 hover:bg-zinc-800/80 hover:text-green-400 hover:rotate-3">
                      <Code className="h-4 w-4 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-125" />
                    </button>

                    <button className="group relative cursor-pointer rounded-lg bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:-rotate-6 hover:scale-105 hover:bg-zinc-800/80 hover:text-purple-400">
                      <Code className="h-4 w-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125" />
                    </button>
                  </div>

                  <button className="group relative cursor-pointer rounded-lg border border-zinc-700/30 bg-transparent p-2.5 text-zinc-500 transition-all duration-300 hover:scale-110 hover:bg-zinc-800/80 hover:text-red-400 hover:rotate-2 hover:border-red-500/30">
                    <Mic className="h-4 w-4 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-125" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-zinc-500">
                    <span>{charCount}</span>
                    <span className="text-zinc-400">/{maxChars}</span>
                  </div>

                  <button
                    onClick={handleSend}
                    className="group relative cursor-pointer rounded-xl border-none bg-gradient-to-r from-red-600 to-red-500 p-3 text-white shadow-lg transition-all duration-300 hover:-rotate-2 hover:scale-110 hover:from-red-500 hover:to-red-400 hover:shadow-xl hover:shadow-red-500/30 active:scale-95"
                    style={{
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    <Send className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12 group-hover:scale-110" />
                    <div className="absolute inset-0 scale-110 rounded-xl bg-gradient-to-r from-red-600 to-red-500 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-6 border-t border-zinc-800/50 pt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  <span>
                    Press{" "}
                    <kbd className="shadow-sm inline-flex items-center rounded border border-zinc-600 bg-zinc-800 px-1.5 py-1 font-mono text-xs text-zinc-400">
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

            <div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent, rgba(147, 51, 234, 0.05))",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
