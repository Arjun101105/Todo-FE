import { useState, useEffect } from 'react';
import { useTags } from '../hooks/useTags.ts';
import type { Tag } from '../types/tag.ts';
import type { Todo } from '../types/todo.ts';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  token: string;
  task?: Todo;
}

const TaskModal = ({ isOpen, onClose, onSave, token, task }: TaskModalProps) => {
  const { tags, addTag, loading: tagsLoading, error: tagsError } = useTags(token);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [tagId, setTagId] = useState(task?.tagId || '');
  const [completed, setCompleted] = useState(task?.completed || false);
  
  // New tag creation state
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8B5CF6');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setTagId(task.tagId || '');
      setCompleted(task.completed || false);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setTagId('');
      setCompleted(false);
    }
  }, [task]);

  const isEditMode = !!task;

  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const createdTag = await addTag({ 
        name: newTagName.trim(),
        color: newTagColor
      });
      
      // Automatically select the newly created tag
      if (createdTag) {
        setTagId(createdTag._id);
      }
      
      // Reset form
      setNewTagName('');
      setNewTagColor('#8B5CF6');
      setShowNewTagForm(false);
      
      // The tags list will be automatically updated through the useTags hook
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tagId: tagId || undefined,
        completed,
      };
      await onSave(newTask);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {isEditMode ? 'Edit Task' : 'Create New Task'}
                </h3>
                <p className="text-purple-100 text-sm">
                  {isEditMode ? 'Update your task details' : 'Add a new task to your workflow'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl transition duration-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition duration-200"
                placeholder="Enter a descriptive title for your task"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition duration-200"
                rows={3}
                placeholder="Add more details about your task (optional)"
              />
            </div>

            {/* Due Date Field */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-200"
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag {!isEditMode && "(optional)"}
              </label>
              
              {tagsLoading && <p className="text-gray-600 text-sm">Loading tags...</p>}
              {tagsError && <p className="text-red-500 text-sm">{tagsError}</p>}
              
              <select
                id="tag"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="block w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-200 mb-3"
              >
                <option value="">Select a tag (optional)</option>
                {tags.map((tag: Tag) => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>

              {/* Add New Tag Section - Show for both new and edit tasks */}
              <div>
                {!showNewTagForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewTagForm(true)}
                    className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium transition duration-200"
                  >
                    <span className="mr-1">+</span>
                    Create New Tag
                  </button>
                )}

                {showNewTagForm && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">Choose color</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleCreateNewTag}
                        disabled={isCreatingTag || !newTagName.trim()}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                      >
                        {isCreatingTag ? 'Creating...' : 'Create Tag'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTagForm(false);
                          setNewTagName('');
                          setNewTagColor('#8B5CF6');
                        }}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Checkbox */}
            {isEditMode && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-300"
                  />
                  <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                    Mark this task as completed
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-200 font-medium shadow-lg transform hover:scale-105"
              >
                {isEditMode ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;