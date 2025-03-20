import { create } from "zustand";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date;
}

interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  duration: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task["status"]) => void;
}

export const usePomodoroStore = create<PomodoroState>((set) => ({
  isRunning: false,
  timeLeft: 25 * 60, // 25 minutes en secondes
  duration: 25 * 60,
  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  resetTimer: () => set({ timeLeft: 25 * 60, isRunning: false }),
  setDuration: (duration) => set({ duration, timeLeft: duration }),
}));

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: crypto.randomUUID() }],
    })),
  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  moveTask: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
})); 