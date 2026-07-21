"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scrollToElementLinear(targetId: string, duration = 750) {
  const element = document.getElementById(targetId);
  if (!element) return;

  const headerOffset = 110;
  const startY = window.scrollY;
  const targetY = Math.max(0, element.getBoundingClientRect().top + window.scrollY - headerOffset);
  const distance = targetY - startY;
  const startTime = performance.now();

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * progress);

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    history.replaceState(null, "", `#${targetId}`);
  }

  requestAnimationFrame(frame);
}

export function ScrollToSectionButton({
  targetId,
  children,
  className,
  variant = "pill-outline",
  size = "pill",
}: {
  targetId: string;
  children: ReactNode;
  className?: string;
  variant?: Parameters<typeof Button>[0]["variant"];
  size?: Parameters<typeof Button>[0]["size"];
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => scrollToElementLinear(targetId)}
    >
      {children}
    </Button>
  );
}
