"use client";

import { useRef, type ReactNode } from "react";

/**
 * A horizontal rail you can throw with the mouse, not just the wheel.
 *
 * Touch already drags; a mouse does not, and on a desktop a rail with no
 * visible scrollbar reads as static. Pointer events cover both without
 * branching on input type.
 *
 * The one subtlety is the click that follows a drag. Every card in these rails
 * is a link, so releasing after a drag would navigate. A drag past a few pixels
 * therefore swallows the next click in the capture phase, which is early enough
 * to stop the link ever seeing it.
 */
export function DragRail({
  children,
  className = "",
  innerRef,
}: {
  children: ReactNode;
  className?: string;
  /** Handed the scrolling element, for callers that also drive it themselves. */
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = innerRef ?? localRef;
  const start = useRef({ x: 0, scroll: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Left button only; let the browser keep middle-click and context menus.
    if (e.button !== 0 || !ref.current) return;
    dragging.current = true;
    moved.current = false;
    start.current = { x: e.clientX, scroll: ref.current.scrollLeft };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !ref.current) return;
    const dx = e.clientX - start.current.x;
    if (Math.abs(dx) > 4) {
      moved.current = true;
      // Claimed late, only once this is clearly a drag — capturing on pointer
      // down would break a plain click on a card.
      ref.current.setPointerCapture(e.pointerId);
    }
    ref.current.scrollLeft = start.current.scroll - dx;
  }

  function end(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId);
  }

  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (!moved.current) return;
    e.preventDefault();
    e.stopPropagation();
    moved.current = false;
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onClickCapture={onClickCapture}
      // Lenis animates the window scroll and would otherwise swallow the wheel
      // events this rail needs for trackpad scrolling.
      data-lenis-prevent
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  );
}
