import { DownloadsClient } from "@/components/orders/DownloadsClient";
import { getCurrentUser } from "@/lib/mock-auth";
import { getDigitalDownloads } from "@/lib/queries/requests";

export const metadata = {
  title: "Downloads - Modesy",
  description: "Download your digital purchases and files",
};

export default async function DownloadsPage() {
  const user = await getCurrentUser();
  const downloads = user ? await getDigitalDownloads(user.id) : [];

  return <DownloadsClient initialDownloads={downloads} />;
}
