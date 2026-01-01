/* eslint-disable react/prop-types */

import { MotionConfig } from "framer-motion";

/**
 * AnimationProvider
 *
 * - GSAP requires NO provider
 * - Framer Motion is optional but wrapped for:
 *   - reduced motion support
 *   - shared config
 *   - future extensibility
 *
 * This provider is safe even if only GSAP is used.
 */
export default function AnimationProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
