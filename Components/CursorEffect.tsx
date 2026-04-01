"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const CursorTracker = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      className="size-4 rounded-full bg-black fixed z-9999 top-0 left-0 pointer-events-none"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "tween"}}
      style={{
        translateX: "-50%",
        translateY: "-50%",
      }}
      />
    
  );
};

export default CursorTracker;