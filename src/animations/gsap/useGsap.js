import { useLayoutEffect } from "react";
import gsap from "gsap";

export function useGsap(ref, animation) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => animation(gsap), ref);
    return () => ctx.revert();
  }, [ref, animation]);
}
