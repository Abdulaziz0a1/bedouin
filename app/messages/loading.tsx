import { Sk, SkeletonMessageThread } from "@/components/ui/Skeleton";

function ConversationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-[#f0e8de]">
      <Sk variant="img" className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Sk className="h-3.5 w-28 rounded" />
          <Sk className="h-2.5 w-12 rounded" />
        </div>
        <Sk className="h-3 w-4/5 rounded" />
        <Sk className="h-3 w-3/5 rounded" />
      </div>
    </div>
  );
}

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[#f4efe6] pt-[72px] flex flex-col">
      <div className="flex-1 flex max-w-[1232px] w-full mx-auto overflow-hidden" style={{ height: "calc(100vh - 72px)" }}>

        {/* Left: conversation list */}
        <div className="w-full md:w-[360px] shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
            <Sk className="h-5 w-24 rounded" />
            <Sk className="h-9 w-full rounded-xl" />
          </div>
          {/* Conversations */}
          <div className="flex-1 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <ConversationRowSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right: message thread */}
        <div className="hidden md:flex flex-1 flex-col bg-white overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8dfd4] shrink-0">
            <Sk variant="img" className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Sk className="h-3.5 w-32 rounded" />
              <Sk className="h-2.5 w-24 rounded" />
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <SkeletonMessageThread />
          </div>
          {/* Input area */}
          <div className="px-6 py-4 border-t border-[#e8dfd4] shrink-0">
            <Sk className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
