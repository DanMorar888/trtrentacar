export function CarListSkeleton() {
  return (
    <div className="container-narrow">
      <aside className="mb-8 border-b border-gray-200 pb-6">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-40 rounded bg-gray-100" />
        <div className="mt-3 flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-28 rounded bg-gray-100" />
          ))}
        </div>
      </aside>
      <div className="space-y-12">
        {[1, 2].map((block) => (
          <div key={block}>
            <div className="mb-6 h-7 w-32 rounded bg-gray-200" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] animate-pulse bg-gray-200" />
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 h-4 w-20 rounded bg-gray-100" />
                      <div className="h-5 w-3/4 rounded bg-gray-200" />
                      <div className="mt-2 flex gap-4">
                        <div className="h-4 w-12 rounded bg-gray-100" />
                        <div className="h-4 w-16 rounded bg-gray-100" />
                        <div className="h-4 w-14 rounded bg-gray-100" />
                      </div>
                      <div className="mt-3 h-4 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
