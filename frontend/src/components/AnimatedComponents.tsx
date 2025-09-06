import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1.5,
  formatValue = (val) => val.toString(),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const updateValue = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
      }
    };

    updateValue();
  }, [value, duration, displayValue]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formatValue(displayValue)}
    </motion.span>
  );
};

interface CountdownTimerProps {
  targetTimestamp: number;
  className?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTimestamp,
  className = '',
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, targetTimestamp - now);
      
      setTimeLeft(remaining);
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, isExpired, onExpire]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <motion.div
      className={`font-mono text-sm ${className} ${
        isExpired ? 'text-red-600' : timeLeft < 3600 ? 'text-warning-600' : 'text-neutral-700'
      }`}
      animate={timeLeft < 300 && !isExpired ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {isExpired ? 'EXPIRED' : formatTime(timeLeft)}
    </motion.div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className = '',
  showLabel = false,
  animated = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`progress-bar ${className}`}>
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animated ? 1.2 : 0,
          ease: 'easeOut',
        }}
      >
        {showLabel && (
          <div className="flex items-center justify-center h-full text-xs font-semibold text-white">
            {Math.round(percentage)}%
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedNumber;
