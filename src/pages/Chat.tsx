import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "rider" | "driver";
  time: string;
}

const initialMessages: Message[] = [];

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDriverChat = location.pathname.startsWith("/driver");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: input.trim(),
        sender: isDriverChat ? "driver" : "rider",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");

    // TODO: Send message via real-time messaging when implemented
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="safe-top px-4 pt-3 pb-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(isDriverChat ? "/driver" : "/rider")} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
          {isDriverChat ? "R" : "D"}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{isDriverChat ? "Rider" : "Driver"}</p>
          <p className="text-xs text-primary">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "rider" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              msg.sender === "rider"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-foreground rounded-bl-md"
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${
                msg.sender === "rider" ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="safe-bottom px-4 pt-3 pb-2 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
