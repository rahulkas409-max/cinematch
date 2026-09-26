import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 text-center">
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
        {["100% free", "No login", "No paywalls", "Your data stays on your device"].map((t) => (
          <span key={t} className="chip border-line bg-white/60 text-ink-soft">
            {t}
          </span>
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-1.5 font-script text-xl text-ink-soft">
        made with <Heart className="size-4 fill-rose text-rose" /> for two
      </p>
    </footer>
  );
}
