"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { Bot, CornerDownLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site-config";

type Role = "user" | "assistant";
interface Message {
  id: number;
  role: Role;
  content: string;
}

const GREETING: Message = {
  id: 0,
  role: "assistant",
  content:
    "Hi, I'm Red Rose's assistant. Ask me about managed IT, dental and medical practice support, HIPAA, or our AI and automation clinics. What's going on in your business?",
};

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(1);

  const send = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: nextId.current++,
        role: "user",
        content: text,
      };
      const replyId = nextId.current++;

      // Show the question and an empty reply the stream fills in.
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: replyId, role: "assistant", content: "" },
      ]);
      setIsLoading(true);

      const history = [...messages, userMessage]
        .filter((m) => m.content.trim().length > 0)
        .map(({ role, content }) => ({ role, content }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "The assistant is unavailable.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        // Paint tokens as they arrive so the reply never feels stalled.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === replyId ? { ...m, content: acc } : m))
          );
        }

        if (!acc.trim()) {
          throw new Error("Empty response.");
        }
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : "Something went wrong.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId
              ? {
                  ...m,
                  content: `${message} You can reach us on ${PHONE_DISPLAY} and we will help directly.`,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    void send(text);
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h2 className="text-xl font-semibold">Ask Red Rose</h2>
        <p className="text-sm text-muted-foreground">
          IT, security and automation questions, answered
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                fallback={message.role === "user" ? "You" : "RR"}
              />
              <ChatBubbleMessage
                variant={message.role === "user" ? "sent" : "received"}
                isLoading={
                  message.role === "assistant" &&
                  message.content.length === 0 &&
                  isLoading
                }
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
        <div aria-live="polite" className="sr-only">
          {isLoading ? "Assistant is replying" : ""}
        </div>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask Red Rose a question
          </label>
          <ChatInput
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about managed IT, HIPAA, dental software..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <Button
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
              disabled={isLoading || !input.trim()}
            >
              Send
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}
