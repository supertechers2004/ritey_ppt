import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <Sidebar />
      {/* Main content area: offset by sidebar width, full height */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        {/* Scrollable content — scrollbar hidden, h-full passed to children */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-14 h-full">
          <div className="h-full max-w-[1400px] mx-auto px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

