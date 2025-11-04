import KanbanBoard from "@/components/board/KanbanBoard";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <KanbanBoard />
    </div>
  );
}
