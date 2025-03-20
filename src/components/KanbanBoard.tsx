"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '1', content: 'Complete project documentation', priority: 'high' },
      { id: '2', content: 'Review pull requests', priority: 'medium' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: '3', content: 'Implement new feature', priority: 'high' },
      { id: '4', content: 'Fix bug in login flow', priority: 'low' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: '5', content: 'Setup project structure', priority: 'medium' },
      { id: '6', content: 'Create initial components', priority: 'high' },
    ],
  },
];

const priorityColors = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
};

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-red-400' },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const task = sourceColumn?.tasks.find(t => t.id === draggableId);

    if (!sourceColumn || !task) return;

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== draggableId),
        };
      }
      if (col.id === destination.droppableId) {
        const newTasks = [...col.tasks];
        newTasks.splice(destination.index, 0, task);
        return {
          ...col,
          tasks: newTasks,
        };
      }
      return col;
    });

    setColumns(newColumns);
  };

  const validateTask = (content: string): boolean => {
    if (!content.trim()) {
      setError('Task content cannot be empty');
      return false;
    }
    if (content.length > 100) {
      setError('Task content is too long (max 100 characters)');
      return false;
    }
    return true;
  };

  const addTask = async () => {
    if (!validateTask(newTask)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        content: newTask.trim(),
        priority: selectedPriority,
      };

      setColumns(prev =>
        prev.map(col =>
          col.id === 'todo'
            ? { ...col, tasks: [...col.tasks, newTaskObj] }
            : col
        )
      );

      setNewTask('');
      setSelectedPriority('medium');
    } catch {
      setError('Failed to add task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.filter(task => task.id !== taskId),
            }
          : col
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className={`bg-primary-500 w-full px-4 py-2 rounded-lg bg-dark-800/50 ${
                error ? 'border-red-500' : 'border-dark-700'
              } focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-colors text-light-100 placeholder:text-light-300/50`}
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Task['priority'])}
              className="bg-primary-500 px-4 py-2 rounded-lg bg-dark-800/50 border-dark-700 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-colors appearance-none cursor-pointer"
              disabled={isSubmitting}
            >
              {priorityOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className={`${option.color} bg-dark-800`}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={addTask}
              disabled={isSubmitting || !newTask.trim()}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSubmitting || !newTask.trim()
                  ? 'bg-primary-500/50 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              } text-white`}
            >
              {isSubmitting ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-light-200">{column.title}</h3>
                <span className="px-2 py-1 text-sm rounded-full bg-dark-800/50 text-light-300">
                  {column.tasks.length}
                </span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] p-4 rounded-lg transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-dark-800/50 border-2 border-dashed border-primary-400/50'
                        : 'bg-dark-800/30'
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable 
                        key={task.id} 
                        draggableId={task.id} 
                        index={index}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging ? 'rgba(17, 24, 39, 0.9)' : undefined,
                              boxShadow: snapshot.isDragging ? '0 0 20px rgba(139, 92, 246, 0.3)' : undefined,
                              cursor: 'grab',
                            }}
                            className={`p-4 mb-3 rounded-lg bg-dark-800/50 border border-dark-700 shadow-lg ${
                              snapshot.isDragging ? 'backdrop-blur-sm transform -translate-x-1/2 -translate-y-1/2' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-light-200">{task.content}</p>
                                <span className={`inline-block px-2 py-1 mt-2 text-xs rounded-full ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteTask(column.id, task.id)}
                                className="p-1 hover:bg-dark-700 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
} 