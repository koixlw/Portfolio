"use client";

import { useEffect, useRef, useState } from "react";
import FadeUp from "./FadeUp";
import MIcon from "./MIcon";
import { cn } from "@/lib/cn";

type Role = "assistant" | "user";

type Message = {
  id: number;
  role: Role;
  text: string;
};

const SEED_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "先确认一下目标：这个版本要解决的是首屏加载，还是交互卡顿？",
  },
  {
    id: 2,
    role: "user",
    text: "主要是弱网下的白屏，现在要 4 秒多。",
  },
  {
    id: 3,
    role: "assistant",
    text: "那就分三步：关键 CSS 内联、图片渐进式加载、交互层按需引入。目标是 1.5 秒内出首屏。",
  },
];

/** 用户提问后机器人回复的固定台词，循环取用 */
const REPLIES = [
  "好，我先出一版骨架结构，再把动效叠上去，晚点给你可点的原型。",
  "没问题，我拆成两个 PR：先把性能那部分合进去，再处理交互细节。",
  "收到。接口我按你给的字段写，写完再统一对一次类型定义。",
];

export default function ChatPanel({
  initialScroll = "bottom",
  animateMessagesIn = false,
}: {
  initialScroll?: "top" | "bottom";
  animateMessagesIn?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTimer = useRef<number | null>(null);

  /** 只有「跟着底部」时才自动滚动；CTA 用 initialScroll="top"，进场不该把首条挤走 */
  const stickToBottom = useRef(initialScroll === "bottom");
  const nextId = useRef(SEED_MESSAGES.length + 1);
  const replyIndex = useRef(0);

  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    };
  }, []);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    stickToBottom.current = true;
    setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text }]);
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const reply = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;
    replyTimer.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", text: reply }]);
    }, 550);
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10"
      style={{
        background: "rgba(8, 8, 10, 0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* 头部 */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
          <MIcon name="terminal" size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">项目沟通</p>
          <p className="truncate text-[11px] text-white/40">需求 · Sprint 03</p>
        </div>
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m, i) => {
          const bubble = (
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-white/15 text-white/90"
                  : "border border-white/5 bg-white/5 text-white/70",
              )}
            >
              {m.text}
            </div>
          );

          if (!animateMessagesIn) {
            return <div key={m.id}>{bubble}</div>;
          }
          return (
            <FadeUp key={m.id} delay={i * 0.12} y={16}>
              {bubble}
            </FadeUp>
          );
        })}
      </div>

      {/* 输入区 */}
      <div className="p-3">
        <div className="liquid-glass flex items-end gap-2 rounded-2xl p-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              resize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="写下你的需求…"
            className="max-h-24 min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-white/35"
          />
          <button
            type="button"
            onClick={send}
            aria-label="Send"
            className="rounded-xl bg-white p-2 text-black transition-colors hover:bg-white/85"
          >
            <MIcon name="arrow_upward" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
