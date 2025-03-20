"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
}

const defaultSettings: TimerSettings = {
  workTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
};

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(defaultSettings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    const notification = new Audio('/notification.mp3');
    notification.play();

    if (mode === 'work') {
      setCompletedSessions((prev) => {
        const newCount = prev + 1;
        if (newCount % settings.longBreakInterval === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(settings.shortBreakTime * 60);
        }
        return newCount;
      });
    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSettingsChange = (key: keyof TimerSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'workTime' && mode === 'work') {
      setTimeLeft(value * 60);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">
            {mode === 'work' ? 'Work Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-slate-300">
          Sessions: {completedSessions}
        </div>
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Work Time (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workTime}
                onChange={(e) => handleSettingsChange('workTime', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakTime}
                onChange={(e) => handleSettingsChange('shortBreakTime', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => handleSettingsChange('longBreakTime', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Long Break Interval</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) => handleSettingsChange('longBreakInterval', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-white/10"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-primary-500"
              strokeWidth="8"
              fill="none"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * timeLeft) / (settings.workTime * 60)}
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className="btn-primary p-3 rounded-full"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(settings.workTime * 60);
              setMode('work');
            }}
            className="btn-secondary p-3 rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
} 