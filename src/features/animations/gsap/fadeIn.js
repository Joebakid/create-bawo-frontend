export function fadeIn(gsap, target) {
  gsap.fromTo(
    target,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  );
}
