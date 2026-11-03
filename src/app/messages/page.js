import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/mock-auth";
import { getConversations, getMessagesByConversation } from "@/lib/queries/chat";
import { MessagesClient } from "@/components/messages/MessagesClient";

export const metadata = {
  title: "Messages - Modesy",
  description: "Obrolan langsung antara pembeli dan penjual di Modesy Marketplace.",
};

export default async function MessagesPage({ searchParams }) {
  const { chat } = await searchParams;
  const user = await getCurrentUser();
  const conversations = user ? await getConversations(user.id) : [];
  const messages = user ? await getMessagesByConversation(user.id) : {};

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb: "Home / Messages" (text-sm text-gray-500 mb-4) */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link
              href="/"
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </Link>{" "}
            / <span className="text-gray-600 font-medium">Messages</span>
          </nav>

          {/* Accessible single h1 for SEO */}
          <h1 className="sr-only">Messages</h1>

          {/* Chat Container */}
          <MessagesClient
            currentUser={user}
            initialConversations={conversations}
            initialMessages={messages}
            initialChatId={chat || null}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
