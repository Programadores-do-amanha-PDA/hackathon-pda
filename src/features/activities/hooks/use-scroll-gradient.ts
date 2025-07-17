"use client";

import { useEffect, useState, useRef } from "react";

export function useScrollGradient() {
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
    isScrolling: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const checkScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 1;

      setScrollState({
        canScrollUp,
        canScrollDown,
        isScrolling: false,
      });
    };

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setScrollState(prev => ({ ...prev, isScrolling: true }));

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        checkScrollState();
      }, 100);
    };

    const handleResize = () => {
      checkScrollState();
    };

    // Check initial state
    checkScrollState();

    element.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { scrollRef, scrollState };
}
