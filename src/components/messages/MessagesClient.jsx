"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/app/messages/actions";

export function MessagesClient({
  currentUser,
  initialConversations = [],
  initialMessages = {},
  initialChatId = null,
}) {
  const [selectedChatId, setSelectedChatId] = useState(initialChatId);
  const [conversationsList, setConversationsList] = useState(initialConversations);
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");

  const chatBodyRef = useRef(null);

  const userName =
    currentUser?.full_name || currentUser?.name || "Admin";
  const userAvatar =
    currentUser?.avatar_url ||
    currentUser?.avatar ||
    "https://i.pravatar.cc/150?u=admin";

  const activeConversation = conversationsList.find(
    (c) => c.id === selectedChatId
  );

  const currentMessages = activeConversation
    ? chatMessages[activeConversation.id] || []
    : [];

  // Filter conversations by search input
  const filteredConversations = conversationsList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  // Auto scroll ONLY the chat body container to bottom (prevents whole window from scrolling)
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [selectedChatId, chatMessages]);

  // Supabase Realtime: pesan & percakapan baru masuk otomatis
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (!msg) return;
          const isMine = msg.sender_id === currentUser?.id;
          const time = new Date(msg.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setChatMessages((prev) => {
            const existing = prev[msg.conversation_id] || [];
            if (existing.some((m) => m.id === msg.id)) return prev;
            return {
              ...prev,
              [msg.conversation_id]: [
                ...existing,
                { id: msg.id, senderId: isMine ? "me" : "them", text: msg.content, time },
              ],
            };
          });
          setConversationsList((prev) =>
            prev.map((c) =>
              c.id === msg.conversation_id
                ? { ...c, lastMessage: msg.content, time: "Baru saja" }
                : c
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => {
          const conv = payload.new;
          if (!conv) return;
          const myId = currentUser?.id;
          if (conv.buyer_id !== myId && conv.seller_id !== myId) return;
          setConversationsList((prev) => {
            if (prev.some((c) => c.id === conv.id)) return prev;
            const otherId = conv.buyer_id === myId ? conv.seller_id : conv.buyer_id;
            // Resolve profil lawan bicara
            supabase
              .from("profiles")
              .select("full_name, username, avatar_url")
              .eq("id", otherId)
              .single()
              .then(({ data }) => {
                if (!data) return;
                setConversationsList((cur) =>
                  cur.map((c) =>
                    c.id === conv.id
                      ? {
                          ...c,
                          name: data.full_name || data.username || "Pengguna",
                          avatar: data.avatar_url || "",
                        }
                      : c
                  )
                );
              });
            return [
              {
                id: conv.id,
                name: "Pengguna",
                avatar: "",
                lastMessage: "",
                time: "Baru saja",
                unread: 0,
              },
              ...prev,
            ];
          });
          setChatMessages((prev) => ({ ...prev, [conv.id]: [] }));
        }
      );

    // Token harus terpasang sebelum join; tanpa token, RLS menyaring semua event.
    let closed = false;
    supabase.auth.getSession().then(({ data }) => {
      if (closed) return;
      if (data.session?.access_token) supabase.realtime.setAuth(data.session.access_token);
      channel.subscribe();
    });

    return () => {
      closed = true;
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;

    const text = inputText.trim();
    setInputText("");

    const tempId = `tmp-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    // Optimistic append
    setChatMessages((prev) => ({
      ...prev,
      [selectedChatId]: [
        ...(prev[selectedChatId] || []),
        { id: tempId, senderId: "me", text, time: timeStr },
      ],
    }));

    const result = await sendMessageAction({
      conversationId: selectedChatId,
      content: text,
    });
    if (result.error) {
      // Gagal kirim: tarik pesan optimistic
      setChatMessages((prev) => ({
        ...prev,
        [selectedChatId]: (prev[selectedChatId] || []).filter((m) => m.id !== tempId),
      }));
      return;
    }

    // Ganti id temporer dengan id asli supaya echo realtime tidak menduplikat
    if (result.message?.id) {
      setChatMessages((prev) => ({
        ...prev,
        [selectedChatId]: (prev[selectedChatId] || []).map((m) =>
          m.id === tempId ? { ...m, id: result.message.id } : m
        ),
      }));
    }
    setConversationsList((prev) =>
      prev.map((c) =>
        c.id === selectedChatId ? { ...c, lastMessage: text, time: "Baru saja" } : c
      )
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs h-[600px] grid grid-cols-1 md:grid-cols-3">
      {/* ======================================================== */}
      {/* KIRI — CHAT LIST (col-span-1, border-r) */}
      {/* ======================================================== */}
      <div
        className={`${
          selectedChatId !== null ? "hidden md:flex" : "flex"
        } col-span-1 border-r border-gray-200 flex-col h-full bg-white min-h-0`}
      >
        {/* 1. Header: Avatar user login + Nama user */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 shrink-0">
          <img
            src={userAvatar}
            alt={userName}
            className="size-10 rounded-full object-cover border border-teal-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </h2>
          </div>
        </div>

        {/* 2. Search Bar */}
        <div className="p-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 bg-white transition-all duration-200"
            />
            <Search className="size-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Label "Recent Chats" */}
        <div className="text-xs uppercase text-gray-400 px-3 py-2 font-semibold tracking-wider shrink-0">
          Recent Chats
        </div>

        {/* 4. List Chat (overflow-y-auto, flex-1) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No chats found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = selectedChatId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChatId(conv.id)}
                  className={`flex items-center gap-3 px-3 py-3 cursor-pointer rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-teal-50 border-l-4 border-teal-600"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="size-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {conv.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {conv.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* KANAN — CHAT AREA (col-span-2) */}
      {/* ======================================================== */}
      <div
        className={`${
          selectedChatId === null ? "hidden md:flex" : "flex"
        } col-span-1 md:col-span-2 flex-col h-full bg-white min-h-0`}
      >
        {/* STATE 1: BELUM PILIH CHAT */}
        {!activeConversation ? (
          <div className="flex-1 flex flex-col justify-between h-full min-h-0">
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-gray-100 rounded-full px-6 py-3 text-gray-500 text-sm font-medium">
                Select a chat to start messaging
              </div>
            </div>

            {/* Bottom empty disabled input bar */}
            <div className="border-t border-gray-200 p-3 flex items-center gap-2 bg-gray-50/40 shrink-0">
              <input
                type="text"
                placeholder="Write a message..."
                disabled
                className="flex-1 text-sm bg-transparent border-none outline-none text-gray-400 placeholder:text-gray-400 px-3 cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                className="p-2 text-gray-300 rounded-full cursor-not-allowed"
              >
                <Send className="size-5" />
              </button>
            </div>
          </div>
        ) : (
          /* STATE 2: SUDAH PILIH CHAT */
          <div className="flex-1 flex flex-col h-full min-h-0 justify-between">
            {/* Header: Avatar + Nama + Status */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden -ml-1 mr-1 p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="size-4" />
                </button>
                {(() => {
                  const partnerUsername =
                    activeConversation.username ||
                    (activeConversation.name.toLowerCase().includes("trendshop")
                      ? "daniel-jones"
                      : activeConversation.name.toLowerCase().includes("budi")
                      ? "budi-santoso"
                      : activeConversation.name.toLowerCase().includes("admin")
                      ? "admin"
                      : activeConversation.name.toLowerCase().replace(/\s+/g, "-"));

                  return (
                    <Link
                      href={`/profile/${partnerUsername}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="size-10 rounded-full object-cover shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-teal-600 transition-colors">
                          {activeConversation.name}
                        </h3>
                        <div className="text-xs text-emerald-600 flex items-center gap-1.5 mt-0.5 font-medium">
                          <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          <span>Online</span>
                        </div>
                      </div>
                    </Link>
                  );
                })()}
              </div>
            </div>

            {/* Body: Messages List */}
            <div
              ref={chatBodyRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-white"
            >
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Belum ada pesan. Mulai obrolan dengan mengirim pesan di bawah.
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = msg.senderId === "me";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`${
                          isMe
                            ? "ml-auto bg-teal-600 text-white rounded-2xl rounded-tr-sm"
                            : "mr-auto bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                        } px-4 py-2 text-sm max-w-sm sm:max-w-md break-words shadow-2xs`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">
                        {msg.time}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer: Input + Send Button */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 p-3 bg-white shrink-0"
            >
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all duration-200 bg-white">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-none outline-none focus:outline-none placeholder:text-gray-400 px-2 py-1 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-1.5 text-teal-600 hover:text-teal-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed rounded-full hover:bg-teal-50"
                  aria-label="Send message"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
