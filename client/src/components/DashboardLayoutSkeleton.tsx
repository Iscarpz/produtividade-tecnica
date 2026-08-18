import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#F7F8F7]">
      {/* Sidebar skeleton */}
      <div className="w-[280px] border-r border-[#1A1F24] bg-[#0D1117] p-4 space-y-6">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-md border border-[#A3E635]/35 bg-[#1A1F24]" />
          <Skeleton className="h-4 w-24 rounded bg-white/10" />
        </div>

        {/* Menu items */}
        <div className="space-y-2 px-2">
          <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
        </div>

        {/* User profile area at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-9 w-9 rounded-full bg-[#2E7D32]/40" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20 bg-white/10" />
              <Skeleton className="h-2 w-32 bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Content blocks */}
        <Skeleton className="h-12 w-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
