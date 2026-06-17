const SKELETON_COUNT = 4;

function UserCardSkeleton() {
  return (
    <li className="rounded-2xl border border-[#E5E9EE] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_28px] lg:items-center lg:gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#E5E9EE]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded-full bg-[#E5E9EE]" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-[#EEF1F4]" />
          </div>
        </div>
        <div className="space-y-2 pl-[3.25rem] lg:pl-0">
          <div className="h-3 w-full max-w-[180px] animate-pulse rounded-full bg-[#EEF1F4]" />
          <div className="h-3 w-full max-w-[140px] animate-pulse rounded-full bg-[#EEF1F4]" />
        </div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-[#EEF1F4] pl-[3.25rem] lg:pl-0" />
        <div className="space-y-2 pl-[3.25rem] lg:pl-0">
          <div className="h-3 w-full max-w-[120px] animate-pulse rounded-full bg-[#EEF1F4]" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-[#E5E9EE]" />
        </div>
        <div className="hidden h-5 w-5 animate-pulse rounded-full bg-[#EEF1F4] lg:block" />
      </div>
    </li>
  );
}

export function UserListSkeleton() {
  return (
    <ul className="space-y-2.5">
      {Array.from({length: SKELETON_COUNT}, (_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </ul>
  );
}

export function WillOverviewRowSkeleton() {
  return (
    <li className="rounded-2xl border border-[#E5E9EE] bg-white px-4 py-4 lg:px-5">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#E5E9EE]" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-[#EEF1F4]" />
        </div>
        <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-[#EEF1F4] lg:mt-0" />
        <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-[#EEF1F4] lg:mt-0" />
        <div className="mt-3 space-y-2 lg:mt-0">
          <div className="h-3 w-full max-w-[120px] animate-pulse rounded-full bg-[#EEF1F4]" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-[#E5E9EE]" />
        </div>
        <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-[#EEF1F4] lg:mt-0" />
      </div>
    </li>
  );
}

export function WillOverviewListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({length: SKELETON_COUNT}, (_, index) => (
        <WillOverviewRowSkeleton key={index} />
      ))}
    </ul>
  );
}
