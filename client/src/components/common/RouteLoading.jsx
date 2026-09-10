export default function RouteLoading() {
  return (
    <div className="grid min-h-[45vh] place-items-center bg-[#f5f8fc]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
        <p className="mb-0 text-xs font-bold text-muted">
          Loading Bastly…
        </p>
      </div>
    </div>
  );
}
