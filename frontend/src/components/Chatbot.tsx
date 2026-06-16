"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, MapPin, Loader2, Maximize2, Minimize2 } from "lucide-react";

interface WisataResult {
  id?: string;
  nama_wisata: string;
  kategori_wisata: string;
  lokasi: string;
  deskripsi: string;
  fasilitas: string;
  similarity_score?: number;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  results?: WisataResult[];
}

const formatText = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-blue-200">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Halo! Saya adalah Asisten Wisata LUMINAIRA. Ceritakan liburan seperti apa yang sedang Anda cari di Lampung?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const history = messages.slice(-5).map(m => ({ sender: m.sender, text: m.text }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NLP_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text, history }),
      });

      const data = await res.json();

      if (data.status === "success") {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.response,
          results: data.type === "recommendation" ? data.results : undefined,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Terjadi kesalahan pada server.");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Maaf, sistem sedang mengalami gangguan atau service sedang offline. Coba lagi nanti.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div 
          className={`fixed z-50 overflow-hidden font-sans bg-slate-900 border border-slate-700 shadow-2xl flex flex-col transition-all duration-300 ${
            isFullscreen 
              ? "top-0 left-0 right-0 bottom-0 w-full h-full rounded-none" 
              : "bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-400" />
                LUMINAIRA Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-slate-400 hover:text-white transition-colors"
                title={isFullscreen ? "Perkecil" : "Perbesar"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                  } text-sm leading-relaxed`}
                >
                  {formatText(msg.text)}
                </div>

                {/* Recommendations */}
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-3 space-y-3 w-full pl-2 border-l-2 border-blue-500">
                    {msg.results.map((res, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (res.id) {
                            const el = document.getElementById(`wisata-${res.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              // Optional: add a brief highlight effect
                              el.classList.add('ring-4', 'ring-primary-500', 'ring-opacity-50');
                              setTimeout(() => el.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-50'), 1500);
                            }
                          }
                        }}
                        className="bg-slate-800 border border-slate-700 p-3 rounded-xl hover:bg-slate-750 transition-colors cursor-pointer group"
                      >
                        <h4 className="font-bold text-blue-400 group-hover:text-blue-300 text-sm mb-1 transition-colors">{res.nama_wisata}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                          <MapPin size={12} /> {res.lokasi}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{res.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin text-blue-400" /> Mengetik...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full pl-4 pr-1 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Tanya wisata apa..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-slate-100 disabled:text-slate-400 rounded-full transition-colors flex-shrink-0"
              >
                <Send size={16} className="ml-[1px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
