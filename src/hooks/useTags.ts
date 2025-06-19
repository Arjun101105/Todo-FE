// src/hooks/useTags.ts
import { useState, useEffect } from 'react';
import { getTags, createTag } from '../api/tag.ts';
import type { Tag } from '../types/tag.ts';

export const useTags = (token: string) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getTags(token)
      .then((data) => setTags(data.tags))
      .catch((error) => setError(error instanceof Error ? error.message : 'Failed to load tags'))
      .finally(() => setLoading(false));
  }, [token]);

  const addTag = async (tag: Omit<Tag, '_id' | 'userId' | 'createdAt'>) => {
    try {
      const response = await createTag(tag, token);
      // Immediately update the tags array with the new tag
      setTags(prevTags => [...prevTags, response.tag]);
      return response.tag; // Return the created tag
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create tag');
      throw error; // Re-throw to let the caller handle it
    }
  };

  const refreshTags = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTags(token);
      setTags(data.tags);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  return { tags, loading, error, addTag, refreshTags };
};