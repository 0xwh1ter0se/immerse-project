"use client";

import { useState } from "react";
import { MersiPose } from "./MersiPose";
import { MersiThinking } from "./MersiThinking";
import { Button } from "../ui/Button";

interface ChatMessage {
  id: string;
  sender: "user" | "mersi";
  text: string;
}

export function MersiFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "mersi",
      text: "Hai! Aku Mersi. Mau tanya arti kata gaul, idiom, atau cara mulai belajar dari videomu?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const quickReplies = [
    "Gimana cara mulai?",
    "Apa arti 'a little goes a long way'?",
    "Video apa yang bagus untuk pemula?",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${prev.length + 1}`,
        sender: "user",
        text: text.trim(),
      },
    ]);
    setInputVal("");
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      let reply = "Keren banget! Setiap hari tonton 1 adegan pendek aja udah cukup kok.";
      if (text.toLowerCase().includes("a little")) {
        reply =
          "Artinya 'sedikit demi sedikit lama-lama jadi bukit'. Hal kecil yang konsisten membawa dampak besar!";
      } else if (text.toLowerCase().includes("mulai")) {
        reply =
          "Cukup tempel link YouTube favoritmu di Ruang Belajar, nanti aku buatkan subtitle dua bahasanya.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `mersi-${prev.length + 1}`,
          sender: "mersi",
          text: reply,
        },
      ]);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-modal flex flex-col items-end">
      {/* Panel Chat Mersi */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat Mersi"
          className="mb-3 w-80 sm:w-96 rounded-2xl border border-border bg-bg-surface shadow-card overflow-hidden origin-bottom-right transition-all duration-fast animate-[scale-in_220ms_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <MersiPose name="wink" size="sm" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-bg-surface" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-text-primary">Mersi</h3>
                <p className="text-[0.65rem] text-text-secondary">Teman Belajar Pintar</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              aria-label="Tutup chat"
            >
              ✕
            </button>
          </div>

          {/* Messages list */}
          <div className="max-h-72 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === "user"
                      ? "bg-blue text-text-inverse rounded-br-none"
                      : "bg-bg-elevated text-text-primary border border-border rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="pt-2">
                <MersiThinking />
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5 border-t border-border bg-bg-surface px-3 py-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="rounded-pill border border-border bg-bg-elevated px-2.5 py-1 text-[0.65rem] font-medium text-text-secondary hover:border-blue hover:text-blue transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-bg-surface"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tanya apa saja ke Mersi…"
              className="flex-1 rounded-md border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary focus:border-border-focus focus:outline-none"
            />
            <Button variant="primary" size="sm" type="submit" className="min-h-9 px-3 text-xs">
              Kirim
            </Button>
          </form>
        </div>
      )}

      {/* Floating launcher button: Mersi Head */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka obrolan bersama Mersi"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-bg-surface shadow-card transition-transform duration-fast hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <div className="transition-transform duration-fast group-hover:rotate-6">
          <MersiPose name="wink" size="sm" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-bold text-text-inverse animate-bounce">
          !
        </span>
      </button>
    </div>
  );
}
