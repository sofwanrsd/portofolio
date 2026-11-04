import { getMessages } from "@/lib/data";
import { MessageList } from "@/components/admin/message-list";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pesan" };

type Props = { searchParams: Promise<{ id?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const [{ id }, messages] = await Promise.all([searchParams, getMessages()]);
  return <MessageList messages={messages} initialId={id} />;
}
