import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for a swipe (default: 50px)
  preventDefaultTouchmoveEvent?: boolean; // Prevent default touchmove behavior
  trackMouse?: boolean; // Also track mouse events for desktop testing
}

export const useSwipe = (
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const minSwipeDistance = threshold;

  const onTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    const touch = 'touches' in e ? e.touches[0] : e;
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
  }, [preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Only trigger swipe if horizontal distance is greater than vertical
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
      if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
    } else {
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
      if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      }
    }

    // Reset values
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  }, [handlers, minSwipeDistance]);

  const touchHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...(trackMouse && {
      onMouseDown: onTouchStart,
      onMouseMove: onTouchMove,
      onMouseUp: onTouchEnd,
    }),
  };

  return touchHandlers;
};