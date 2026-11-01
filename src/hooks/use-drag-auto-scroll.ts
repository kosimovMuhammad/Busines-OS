"use client";

import { useCallback, useEffect, useRef } from "react";

const EDGE_ZONE = 80;       // px from top/bottom to trigger scroll
const MAX_SPEED = 18;       // px per frame at the very edge
const FRAME_MS = 16;        // ~60fps

/**
 * Returns handlers to attach to DndContext's onDragMove / onDragEnd.
 * During a drag it auto-scrolls the element under the pointer that is
 * actually scrollable (vertical), respecting the EDGE_ZONE threshold.
 */
export function useDragAutoScroll() {
  const rafRef = useRef<number | null>(null);
  const scrollTargetRef = useRef<Element | null>(null);
  const scrollSpeedRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    scrollTargetRef.current = null;
    scrollSpeedRef.current = 0;
  }, []);

  const tick = useCallback(function step() {
    const el = scrollTargetRef.current;
    if (!el || scrollSpeedRef.current === 0) return;
    el.scrollTop += scrollSpeedRef.current;
    rafRef.current = requestAnimationFrame(step);
  }, []);

  /** Find the closest ancestor (including self) that actually overflows vertically */
  function findScrollable(el: Element | null): Element | null {
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight;
      if (canScroll) return el;
      el = el.parentElement;
    }
    return null;
  }

  const onDragMove = useCallback(
    ({ activatorEvent, delta }: { activatorEvent: Event; delta: { x: number; y: number } }) => {
      // Reconstruct approximate pointer position from the activator + delta
      const ae = activatorEvent as PointerEvent | MouseEvent;
      const pointerX = ae.clientX + delta.x;
      const pointerY = ae.clientY + delta.y;

      const elementUnder = document.elementFromPoint(pointerX, pointerY);
      const scrollable = findScrollable(elementUnder);

      if (!scrollable) {
        stop();
        return;
      }

      const rect = scrollable.getBoundingClientRect();
      const distFromTop = pointerY - rect.top;
      const distFromBottom = rect.bottom - pointerY;

      let speed = 0;
      if (distFromTop < EDGE_ZONE && distFromTop >= 0) {
        // Scroll up — stronger the closer to the top
        speed = -MAX_SPEED * (1 - distFromTop / EDGE_ZONE);
      } else if (distFromBottom < EDGE_ZONE && distFromBottom >= 0) {
        // Scroll down
        speed = MAX_SPEED * (1 - distFromBottom / EDGE_ZONE);
      }

      scrollTargetRef.current = scrollable;
      scrollSpeedRef.current = speed;

      if (speed !== 0 && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (speed === 0) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    },
    [stop, tick]
  );

  // Clean up on unmount
  useEffect(() => () => stop(), [stop]);

  return { onDragMove, onDragEnd: stop, onDragCancel: stop };
}
