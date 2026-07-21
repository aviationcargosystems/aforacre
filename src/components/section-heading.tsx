import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  accent,
  subtitle,
  align = "left",
  className,
  titleClassName,
}: {
  kicker?: string;
  title: string;
  /** A word or phrase within `title` to render in italic Playfair as an accent. */
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const parts = accent && title.includes(accent) ? title.split(accent) : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {kicker && (
        <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="h-px w-8 bg-accent/60" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{kicker}</span>
          <span className="h-px w-8 bg-accent/60" />
        </div>
      )}
      <h2
        className={cn(
          "max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl",
          titleClassName
        )}
      >
        {parts ? (
          <>
            {parts[0]}
            <em className="font-heading italic text-primary">{accent}</em>
            {parts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
