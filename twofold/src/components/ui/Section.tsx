import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
};

/** A titled block inside a module tab. */
export function Section({ eyebrow, title, description, children, id, action }: Props) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="headline mt-1 text-2xl sm:text-[28px]">{title}</h2>
          {description && <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Tab hero with the big editorial headline. */
export function ModuleHero({ kicker, title, italic, blurb }: { kicker: string; title: string; italic: string; blurb: string }) {
  return (
    <header className="px-1 pt-2 pb-2">
      <p className="font-script text-2xl text-rose">{kicker}</p>
      <h1 className="headline text-[40px] leading-[1.02] sm:text-6xl">
        {title} <em className="font-display font-medium text-rose italic">{italic}</em>
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-base">{blurb}</p>
    </header>
  );
}
