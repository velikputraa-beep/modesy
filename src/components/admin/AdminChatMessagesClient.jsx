"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Send, User, Search, Trash2, ExternalLink, MessageSquare } from "lucide-react";

import { useToast } from "@/components/ui/toast-context";
import { deleteMessage } from "@/app/admin/actions";

function Avatar({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        className="size-10 rounded-full object-cover border border-gray-200 shrink-0"
      />
    );
  }
  return (
    <div className="size-10 rounded-full bg-slate-200 border border-gray-200 flex items-center justify-center shrink-0">
      <User className="size-5 text-slate-500" />
    </div>
  );
}

export function AdminChatMessagesClient({
  initialConversations = [],
  initialMessages = [],
}) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [activeChat, setActiveChat] = useState(initialConversations[0] ?? null);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    setConversations(initialConversations);
    setMessages(initialMessages);
    setActiveChat(initialConversations[0] ?? null);
  }, [initialConversations, initialMessages]);

  const messagesForActive = useMemo(() => {
    if (!activeChat) return [];
    return messages
      .filter((m) => m.conversationId === activeChat.id)
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [activeChat, messages]);

  const handleDeleteMessage = async (id) => {
    if (busyKey) return;
    setBusyKey(`del:${id}`);
    const res = await deleteMessage(id);
    setBusyKey(null);
    if (res?.success) {
      toast.success(res.message);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } else {
      toast.error(res?.error || "Gagal menghapus pesan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Chat Messages</h1>
        <p className="text-xs text-gray-500 mt-1">
          Pusat komunikasi obrolan langsung (live chat support) dengan para buyer dan vendor
        </p>
      </div>

      {/* 2-Column Chat Layout */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[620px]">
        {/* Left Column: Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-gray-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                <MessageSquare className="size-6 mx-auto mb-2 text-gray-300" />
                Belum ada percakapan.
              </div>
            ) : (
              conversations.map((chat) => {
                const isSelected = activeChat?.id === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/80 border-l-4 border-blue-500" : "hover:bg-white"
                    }`}
                  >
                    <Avatar src={""} name={chat.buyer} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {chat.buyerUsername ? (
                            <Link
                              href={`/profile/${chat.buyerUsername}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-teal-600 transition-colors"
                            >
                              {chat.buyer}
                            </Link>
                          ) : (
                            chat.buyer
                          )}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">{chat.timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          Buyer
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium truncate max-w-[120px]">
                          {chat.productTitle}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {chat.messageCount} pesan
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                      <Link
                        href={`/messages?chat=${chat.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Buka <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Room (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {/* Room Header */}
          <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
            {activeChat ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar src={""} name={activeChat.buyer} />
                  <div>
                    <h3 className="font-semibold text-xs text-gray-900">
                      {activeChat.buyerUsername ? (
                        <Link
                          href={`/profile/${activeChat.buyerUsername}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {activeChat.buyer}
                        </Link>
                      ) : (
                        activeChat.buyer
                      )}
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      Produk: {activeChat.productTitle} · {activeChat.messageCount} pesan
                    </span>
                  </div>
                </div>
                <Link
                  href={`/messages?chat=${activeChat.id}`}
                  className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 inline-flex items-center gap-1"
                >
                  Buka percakapan <ExternalLink className="size-3" />
                </Link>
              </>
            ) : (
              <div className="text-xs text-gray-400">Pilih percakapan untuk melihat pesan.</div>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {messagesForActive.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Belum ada pesan pada percakapan ini.
              </div>
            ) : (
              messagesForActive.map((msg) => {
                const isSellerSide =
                  activeChat && msg.senderUsername && msg.senderUsername === activeChat.sellerUsername;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSellerSide ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-0.5 px-1">
                      {msg.senderUsername ? (
                        <Link
                          href={`/profile/${msg.senderUsername}`}
                          className="text-[10px] font-semibold text-gray-500 hover:text-teal-600"
                        >
                          {msg.sender}
                        </Link>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-500">{msg.sender}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={busyKey === `del:${msg.id}`}
                        className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        title="Hapus pesan"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                        isSellerSide
                          ? "bg-blue-500 text-white rounded-br-xs"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-xs"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timeAgo}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box — admin balasan tidak tersedia via aksi panel ini */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.info("Balas pesan langsung dari halaman /messages.");
            }}
            className="p-3 border-t border-gray-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Balasan hanya tersedia di halaman /messages..."
              disabled
              className="flex-1 px-3.5 py-2 text-xs border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors cursor-pointer"
              title="Balas dari /messages"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
