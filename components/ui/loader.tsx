"use client"; // Ensure it runs on the client side

import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { theme, systemTheme } = useTheme(); // Get the current theme
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure theme is loaded
  }, []);

  // Determine active theme (fallback to system theme)
  const activeTheme = theme === "system" ? systemTheme : theme;

  if (!mounted) {
    return null; // Prevents theme mismatch flickering
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors ${
        activeTheme === "dark" ? "bg-black text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </motion.div>
      <p className="mt-4 text-lg font-semibold">Loading, please wait...</p>
    </div>
  );
}
