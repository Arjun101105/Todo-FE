import axios from 'axios';
import type { Todo } from '../types/todo';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export interface TodoResponse {
  message: string;
  todos: Todo[];
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface SingleTodoResponse {
  message: string;
  todo: Todo;
}

export interface DeleteResponse {
  message: string;
  deletedCount?: number;
}

export interface StatsResponse {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  tagStats: Array<{ _id: { name: string; color: string }; total: number; completed: number; pending: number }>;
}

export const getTodos = async (
  token: string,
  filters?: { tag?: string; completed?: boolean; sort?: string; limit?: number; page?: number }
): Promise<TodoResponse> => {
  try {
    const response = await api.get('/todo', {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    throw new Error('Failed to fetch todos');
  }
};

// src/api/tasks.ts
export const createTodo = async (
  task: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<SingleTodoResponse> => {
  try {
    console.log('Sending task:', task);
    const response = await api.post('/todo/add-todo', task, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('CreateTodo Error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create todo');
  }
};

export const updateTodo = async (
  id: string,
  task: Partial<Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  token: string
): Promise<SingleTodoResponse> => {
  try {
    const response = await api.put(`/todo/${id}`, task, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update todo');
  }
};

export const deleteTodo = async (id: string, token: string): Promise<SingleTodoResponse> => {
  try {
    const response = await api.delete(`/todo/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete todo');
  }
};

export const toggleTodoComplete = async (id: string, token: string): Promise<SingleTodoResponse> => {
  try {
    const response = await api.patch(`/todo/${id}/toggle-complete`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to toggle todo completion');
  }
};

export const deleteCompletedTodos = async (token: string): Promise<DeleteResponse> => {
  try {
    const response = await api.delete('/todo/batch/completed', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete completed todos');
  }
};

export const getTodoStats = async (token: string): Promise<StatsResponse> => {
  try {
    const response = await api.get('/todo/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch todo stats');
  }
};

export const getTodosByStatus = async (token: string, completed: boolean): Promise<TodoResponse> => {
  try {
    const response = await api.get(`/todo/status/${completed ? 'completed' : 'pending'}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${completed ? 'completed' : 'pending'} todos`);
  }
};