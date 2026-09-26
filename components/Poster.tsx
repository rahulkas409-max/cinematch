import Image from "next/image";
import type { Movie } from "@/data/movies";

/** TMDB poster when available, otherwise generated neon poster art. */
export function Poster({ movie, className = "", sizes = "300px", priority, showTitle = true }: { movie: Movie; className?: string; sizes?: string; priority?: boolean; showTitle?: boolean }) {
  const [from, to] = movie.palette;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}>
      {movie.posterUrl ? (
        <Image src={movie.posterUrl} alt={`${movie.title} poster`} fill sizes={sizes} className="object-cover" priority={priority} draggable={false} />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
          <span className="relative text-[11px] uppercase tracking-[0.25em] text-white/70 font-semibold">{movie.language}</span>
          <div className="relative text-center text-5xl sm:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-widest">{movie.emoji}</div>
          <div className={`relative ${showTitle ? "" : "invisible"}`}>
            <p className="font-display font-extrabold text-white leading-tight text-lg line-clamp-3">{movie.title}</p>
            <p className="text-white/70 text-xs mt-1">{movie.year}</p>
          </div>
        </div>
      )}
    </div>
  );
}
