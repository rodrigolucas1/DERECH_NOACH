"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  hover?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hover = true, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } : undefined}
        whileTap={hover ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
