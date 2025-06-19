// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodoComplete } from '../api/tasks.ts';
import type { Todo } from '../types/todo.ts';

export const useTasks = (token: string) => {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getTodos(token)
      .then((data) => setTasks(data.todos))
      .catch((error) => setError(error instanceof Error ? error.message : 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [token]);

  const addTask = async (task: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createTodo(task, token);
      setTasks(prevTasks => [...prevTasks, response.todo]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  const editTask = async (
    id: string,
    task: Partial<Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const response = await updateTodo(id, task, token);
      setTasks(prevTasks => prevTasks.map((t) => (t._id === id ? response.todo : t)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteTodo(id, token);
      setTasks(prevTasks => prevTasks.filter((t) => t._id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const response = await toggleTodoComplete(id, token);
      setTasks(prevTasks => prevTasks.map((t) => (t._id === id ? response.todo : t)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle task');
    }
  };

  const refreshTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTodos(token);
      setTasks(data.todos);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh tasks');
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, addTask, editTask, removeTask, toggleTask, refreshTasks };
};