export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded mb-6 w-3/4"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-neutral-700 rounded mb-2 w-16"></div>
              <div className="h-10 bg-neutral-700 rounded"></div>
            </div>
            <div>
              <div className="h-4 bg-neutral-700 rounded mb-2 w-20"></div>
              <div className="h-10 bg-neutral-700 rounded"></div>
            </div>
            <div className="h-10 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
