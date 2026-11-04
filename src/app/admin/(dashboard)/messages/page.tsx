import { getMessages } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";
import { MessageList } from "@/components/admin/message-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pesan" };

export default async function MessagesPage() {
  const messages = await getMessages();
  return <MessageList messages={messages} />;
}
