'use client';

import { motion } from 'framer-motion';
import { Clock, Layout, Brain, Sparkles, Star } from 'lucide-react';
import PomodoroTimer from '@/components/PomodoroTimer';
import KanbanBoard from '@/components/KanbanBoard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const STARS = [
  { top: "10%", left: "20%", delay: 0 },
  { top: "20%", left: "80%", delay: 0.2 },
  { top: "30%", left: "40%", delay: 0.4 },
  { top: "40%", left: "60%", delay: 0.6 },
  { top: "50%", left: "30%", delay: 0.8 },
  { top: "60%", left: "70%", delay: 1 },
  { top: "70%", left: "50%", delay: 1.2 },
  { top: "80%", left: "90%", delay: 1.4 },
  { top: "90%", left: "10%", delay: 1.6 },
  { top: "15%", left: "50%", delay: 1.8 },
];

function TwinklingStars() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {STARS.map((star, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            opacity: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-light-100">
      {/* Twinkling Stars Background */}
      <TwinklingStars />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-primary-400 animate-spin" />
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
              FlowSpace
            </h1>
          </motion.div>
          <motion.p variants={itemVariants} className="text-xl text-light-300/80 max-w-2xl mx-auto">
            Boost your productivity with our Pomodoro Timer and Kanban Board
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-8 mb-16"
        >
          <motion.div variants={itemVariants} className="glass-card p-6 col-span-4">
            <div className="flex items-center gap-4 mb-4">
              <Clock className="w-8 h-8 text-primary-400" />
              <h2 className="text-2xl font-bold">Pomodoro Timer</h2>
            </div>
            <PomodoroTimer />
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 col-span-8">
            <div className="flex items-center gap-4 mb-4">
              <Layout className="w-8 h-8 text-primary-400" />
              <h2 className="text-2xl font-bold">Kanban Board</h2>
            </div>
            <KanbanBoard />
          </motion.div>
        </motion.div>

        {/* Key Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="glass-card p-6 text-center">
            <Brain className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Focus Mode</h3>
            <p className="text-light-300/70">
              Stay focused with our Pomodoro Timer and track your productivity
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 text-center">
            <Layout className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Task Management</h3>
            <p className="text-light-300/70">
              Organize your tasks with our intuitive Kanban board
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 text-center">
            <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Beautiful Design</h3>
            <p className="text-light-300/70">
              Modern UI with smooth animations and dark theme
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
