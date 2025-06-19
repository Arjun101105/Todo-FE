import type { Tag } from './tag';

    export interface Todo {
      _id: string;
      title: string;
      description?: string;
      dueDate?: Date;
      tagId?: string | Tag;
      userId: string;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }