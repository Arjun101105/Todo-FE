import axios from 'axios';
    import type { Tag } from '../types/tag';
    import type { Todo } from '../types/todo';

    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

    export interface TagResponse {
      message: string;
      tags: Tag[];
    }

    export interface SingleTagResponse {
      message: string;
      tag: Tag;
    }

    export interface TagTodosResponse {
      message: string;
      tag: Tag;
      todos: Todo[];
    }

    export interface DeleteTagResponse {
      message: string;
    }

    export const getTags = async (token: string): Promise<TagResponse> => {
      try {
        const response = await api.get('/tag', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tags');
      }
    };

    export const createTag = async (
      tag: Omit<Tag, '_id' | 'userId' | 'createdAt'>,
      token: string
    ): Promise<SingleTagResponse> => {
      try {
        const response = await api.post('/tag', tag, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create tag');
      }
    };

    export const updateTag = async (
      id: string,
      tag: Partial<Omit<Tag, '_id' | 'userId' | 'createdAt'>>,
      token: string
    ): Promise<SingleTagResponse> => {
      try {
        const response = await api.put(`/tag/${id}`, tag, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update tag');
      }
    };

    export const deleteTag = async (id: string, token: string): Promise<DeleteTagResponse> => {
      try {
        const response = await api.delete(`/tag/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete tag');
      }
    };

    export const getTodosByTag = async (tagId: string, token: string): Promise<TagTodosResponse> => {
      try {
        const response = await api.get(`/tag/${tagId}/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch todos by tag');
      }
    };