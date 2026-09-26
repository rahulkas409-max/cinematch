/** Soft, drifting colour blobs behind every page: the warm "lovable" wash. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] animate-float rounded-full bg-rose/25 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] animate-float rounded-full bg-amber/20 blur-3xl [animation-delay:-2s]" />
      <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] animate-float rounded-full bg-sage/20 blur-3xl [animation-delay:-4s]" />
      <div className="absolute top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#f7c1c9]/30 blur-3xl" />
    </div>
  );
}
