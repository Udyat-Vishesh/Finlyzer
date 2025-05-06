import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export default function Spinner({
  size = "md",
  className,
  fullScreen = false,
  text,
}: SpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Container styling based on fullScreen prop
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-4";

  return (
    <div className={cn(containerClass, className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent border-primary",
          sizeMap[size],
          size === "sm" ? "border-2" : "border-4"
        )}
        style={{
          borderRightColor: "var(--border-primary)",
          borderBottomColor: "var(--border-primary)",
          borderLeftColor: "var(--border-primary)",
        }}
      />
      {text && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{text}</div>
      )}
    </div>
  );
}

// Alternative spinner designs
export function PulseSpinner({ size = "md", className, fullScreen = false, text }: SpinnerProps) {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-4";

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex space-x-2">
        <div
          className={cn(
            "rounded-full bg-primary animate-pulse-fade",
            sizeMap[size]
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-primary animate-pulse-fade",
            sizeMap[size]
          )}
          style={{ animationDelay: "300ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-primary animate-pulse-fade",
            sizeMap[size]
          )}
          style={{ animationDelay: "600ms" }}
        />
      </div>
      {text && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{text}</div>
      )}
    </div>
  );
}

export function BarSpinner({ size = "md", className, fullScreen = false, text }: SpinnerProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-4";

  // Size mapping
  const barHeight = size === "sm" ? "h-1" : size === "md" ? "h-1.5" : "h-2";
  const barWidth = size === "sm" ? "w-16" : size === "md" ? "w-24" : "w-32";

  return (
    <div className={cn(containerClass, className)}>
      <div className={cn("relative overflow-hidden rounded-full", barWidth, barHeight, "bg-gray-200 dark:bg-gray-700")}>
        <div 
          className="absolute top-0 h-full w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full animate-loading-bar"
        />
      </div>
      {text && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{text}</div>
      )}
    </div>
  );
}