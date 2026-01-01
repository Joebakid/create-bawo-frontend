import { MotionConfig } from "framer-motion";

export default function MotionProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
