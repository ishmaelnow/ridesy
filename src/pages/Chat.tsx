import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRide } from "@/contexts/RideContext";

interface Message {
  id: string;
  ride_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuth();
  const { activeRideId, ride, addNotification } = useRide();
  const isDriverChat = location.pathname.startsWith("/driver");

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const channelRef                = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const rideId = activeRideId;

  // ─── Load existing messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    supabase
      .from("messages")
      .select("*")
      .eq("ride_id", rideId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, [rideId]);

  // ─── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!rideId) return;

    const channel = supabase
      .channel(`messages-${rideId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "messages",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate: optimistic insert may already be present
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // Notify rider when driver sends a message
          if (msg.sender_id !== user?.id) {
            addNotification({
              title:   "New Message",
              message: msg.text.length > 60 ? msg.text.slice(0, 57) + "…" : msg.text,
              read:    false,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [rideId, user?.id]);

  // ─── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !rideId || !user || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      ride_id:   rideId,
      sender_id: user.id,
      text,
    });

    if (error) {
      toast.error("Message failed to send");
      setInput(text); // restore on error
    }

    setSending(false);
  };

  const driverName = ride.driver?.name || "Driver";

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="safe-top px-4 pt-3 pb-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(isDriverChat ? "/driver" : "/rider")}
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
          {isDriverChat ? "R" : driverName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isDriverChat ? "Rider" : driverName}
          </p>
          <p className="text-xs text-muted-foreground">Active ride</p>
        </div>
      </div>

      {/* No active ride warning */}
      {!rideId && (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Chat is only available during an active ride.
          </p>
        </div>
      )}

      {/* Messages */}
      {rideId && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      {rideId && (
        <div className="safe-bottom px-4 pt-3 pb-2 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
