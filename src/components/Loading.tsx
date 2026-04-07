import { motion } from "motion/react";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <motion.div
        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg font-medium text-muted-foreground"
      >
        Generating questions with AI...
      </motion.p>
    </div>
  );
}
