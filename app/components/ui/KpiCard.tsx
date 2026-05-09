"use client";

import { motion } from "framer-motion";

type Props = {
  title: string;
  value: string;
  trend?: string;
  insight?: string;
  positive?: boolean;
};

export default function KpiCard({
  title,
  value,
  trend,
  insight,
  positive = true,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-zinc-400">{title}</h3>

        <div
          className={`h-2 w-2 rounded-full ${
            positive ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="mt-4 text-3xl font-bold text-white">
        {value}
      </div>

      {trend && (
        <div
          className={`mt-2 text-sm ${
            positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend}
        </div>
      )}

      {insight && (
        <div className="mt-4 rounded-xl bg-zinc-900 p-3 text-sm text-zinc-300">
          {insight}
        </div>
      )}
    </motion.div>
  );
}