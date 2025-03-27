"use client";

import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Settings, Bell } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
}

const defaultSettings: TimerSettings = {
  workTime: 25 * 60, // 25 minutes
  shortBreakTime: 5 * 60, // 5 minutes
  longBreakTime: 15 * 60, // 15 minutes
  longBreakInterval: 4, // 4 sessions
};

export default function PomodoroTimer() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useLocalStorage<TimerSettings>('pomodoro-settings', defaultSettings);
  const [timeLeft, setTimeLeft] = useState(settings.workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useLocalStorage<number>('completed-sessions', 0);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Error playing sound:', error);
      });
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playSound();

    if (mode === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      if (newCompletedSessions % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakTime);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakTime);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workTime);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workTime);
    setMode('work');
  };

  const handleSettingsChange = (key: keyof TimerSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 1) return;

    setSettings(prev => ({ ...prev, [key]: key === 'longBreakInterval' ? numValue : numValue * 60 }));
    if (key === 'workTime' && mode === 'work') {
      setTimeLeft(numValue * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = mode === 'work' 
      ? settings.workTime 
      : mode === 'shortBreak' 
        ? settings.shortBreakTime 
        : settings.longBreakTime;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-red-400';
      case 'shortBreak':
        return 'text-green-400';
      case 'longBreak':
        return 'text-blue-400';
      default:
        return 'text-light-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-dark-800/50 rounded-lg border border-dark-700 shadow-lg">
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-light-300">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-dark-800/50 rounded-lg border border-dark-700 shadow-lg">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-semibold text-light-200">Pomodoro Timer</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm rounded-full bg-dark-700 text-light-300">
            {completedSessions} sessions
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-dark-700 rounded-full transition-colors"
          >
            <Settings className="w-4 h-4 text-primary-400" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 rounded-lg bg-dark-700/50 border border-dark-600">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-light-300 mb-1">Work Time (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.floor(settings.workTime / 60) || ''}
                onChange={(e) => handleSettingsChange('workTime', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-primary-500 border border-dark-600 text-light-100 placeholder:text-light-400 focus:ring-1 focus:ring-dark-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-light-300 mb-1">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={Math.floor(settings.shortBreakTime / 60) || ''}
                onChange={(e) => handleSettingsChange('shortBreakTime', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-primary-500 border border-dark-600 text-light-100 placeholder:text-light-400 focus:ring-1 focus:ring-dark-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-light-300 mb-1">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.floor(settings.longBreakTime / 60) || ''}
                onChange={(e) => handleSettingsChange('longBreakTime', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-primary-500 border border-dark-600 text-light-100 placeholder:text-light-400 focus:ring-1 focus:ring-dark-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-light-300 mb-1">Long Break Interval</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval || ''}
                onChange={(e) => handleSettingsChange('longBreakInterval', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-primary-500 border border-dark-600 text-light-100 placeholder:text-light-400 focus:ring-1 focus:ring-dark-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-8">
        <svg className="w-full h-48" viewBox="0 0 100 100">
          <circle
            className="text-dark-700"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className={getModeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: '264',
              strokeDashoffset: `${264 - (264 * getProgress()) / 100}`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold text-light-200 mb-2">{formatTime(timeLeft)}</div>
            <div className={`text-sm font-medium capitalize ${getModeColor()}`}>
              {mode === 'work' ? 'Work' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className="p-4 rounded-full bg-primary-500 hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          {isRunning ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-dark-700 hover:bg-dark-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <RotateCcw className="w-6 h-6 text-light-300" />
        </button>
      </div>
    </div>
  );
} 