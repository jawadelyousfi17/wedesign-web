"use client";

import { useEffect, useRef, useState } from "react";

type EasingFunction = (t: number) => number;

const easings: Record<string, EasingFunction> = {
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  linear: (t) => t,
};

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  easing?: keyof typeof easings;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  startOnView?: boolean;
  formatter?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 2000,
  easing = "easeOutQuart",
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
  startOnView = false,
  formatter,
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(!startOnView);
  const spanRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousValueRef = useRef(0);

  // Respect user's motion preferences
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Trigger animation only when element is in view
  useEffect(() => {
    if (!startOnView || !spanRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(spanRef.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!isInView) return;

    // Skip animation for reduced motion preference
    if (prefersReducedMotion) {
      setCount(value);
      previousValueRef.current = value;
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const easingFn = easings[easing];
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easingFn(progress);
      const currentValue = startValue + (endValue - startValue) * eased;

      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration, easing, isInView, prefersReducedMotion]);

  const formatNumber = (num: number): string => {
    if (formatter) return formatter(num);

    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split(".");
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${withSeparator}.${decPart}` : withSeparator;
  };

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}