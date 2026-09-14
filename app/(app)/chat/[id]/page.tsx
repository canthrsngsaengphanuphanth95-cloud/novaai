import { ChatWindow } from '@/components/chat/ChatWindow';
export default function ChatByIdPage({ params }: { params: { id: string } }) {
  return <ChatWindow convId={params.id} />;
}