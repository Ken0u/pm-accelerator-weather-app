"use client";

import { motion } from "framer-motion";

interface ErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="alert"
      className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-red-100"
    >
      <svg className="relative h-5 w-5 shrink-0 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="relative flex-1 text-sm">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="relative shrink-0 text-red-200/70 transition-colors hover:text-red-100"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
