import { motion } from "framer-motion";
import { Plane } from "lucide-react";

interface FlightLoadingStateProps {
  flightNumber?: string;
}

export function FlightLoadingState({ flightNumber }: FlightLoadingStateProps) {
  return (
    <div className="flex items-center justify-between w-full p-4 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
          <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-1">
          <span className="text-neutral-700 dark:text-neutral-300 text-lg font-medium">
            Tracking flight{flightNumber ? ` ${flightNumber}` : ''}...
          </span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Fetching real-time flight information
          </p>
        </div>
      </div>
      
      {/* Animated loading dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: index * 0.2,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Error state component
interface FlightErrorStateProps {
  error: string;
  flightNumber?: string;
}

export function FlightErrorState({ error, flightNumber }: FlightErrorStateProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
      <div className="w-10 h-10 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
        <Plane className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-1">
        <span className="text-red-700 dark:text-red-300 text-lg font-medium">
          Error tracking flight{flightNumber ? ` ${flightNumber}` : ''}
        </span>
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    </div>
  );
}