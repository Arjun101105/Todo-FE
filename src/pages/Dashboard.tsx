import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useTasks } from '../hooks/useTasks.ts';
import { useTags } from '../hooks/useTags.ts';
import TaskModal from '../components/TaskModal.tsx';
import type { Tag } from '../types/tag.ts';
import type { Todo } from '../types/todo.ts';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const { tasks, addTask, editTask, removeTask, loading: tasksLoading, error: tasksError, refreshTasks } = useTasks(token || '');
  const { tags, loading: tagsLoading, error: tagsError, refreshTags } = useTags(token || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleAddTask = async (task: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTask(task);
      // Refresh both tasks and tags to ensure the dashboard shows updated data
      await Promise.all([refreshTasks(), refreshTags()]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleEditTask = async (task: Omit<Todo, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      try {
        await editTask(editingTask._id, task);
        setEditingTask(null);
        // Refresh both tasks and tags to ensure the dashboard shows updated data
        await Promise.all([refreshTasks(), refreshTags()]);
      } catch (error) {
        console.error('Failed to edit task:', error);
      }
    }
  };

  const handleToggleComplete = async (task: Todo) => {
    try {
      await editTask(task._id, { completed: !task.completed });
      // Refresh tasks to update the UI immediately
      await refreshTasks();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await removeTask(taskId);
      // Refresh tasks to update the UI immediately
      await refreshTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const filteredTasks = selectedTag
    ? tasks.filter((task) => {
        const tagId = typeof task.tagId === 'object' ? task.tagId?._id : task.tagId;
        return tagId === selectedTag;
      })
    : tasks;

  // Helper function to get tag for display with color
  const getTagDisplay = (task: Todo) => {
    if (!task.tagId) {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
          No tag
        </span>
      );
    }
    
    let tag: Tag | undefined;
    
    // If tagId is an object (populated), use it directly
    if (typeof task.tagId === 'object') {
      tag = task.tagId as Tag;
    } else if (typeof task.tagId === 'string') {
      // If tagId is a string, find the tag in our tags array
      tag = tags.find((t: Tag) => t._id === task.tagId);
    }
    
    if (tag) {
      return (
        <span 
          className="inline-block px-2 py-1 text-xs rounded-full text-white"
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
        </span>
      );
    }
    
    return (
      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
        No tag
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* TaskFlow Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">TaskFlow</h1>
                  <p className="text-purple-100 text-sm">Welcome back, {user?.username || 'User'}!</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition duration-200 text-sm sm:text-base font-medium backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-200 font-medium shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Task
              </button>
            </div>

            {/* Tag Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Tag</h3>
              {tagsLoading && <p className="text-gray-600 text-sm">Loading tags...</p>}
              {tagsError && <p className="text-red-500 text-sm">{tagsError}</p>}
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition duration-200"
              >
                <option value="">All Tasks</option>
                {tags.map((tag: Tag) => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-800">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">{tasks.filter(t => !t.completed).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Task Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
                <div className="text-sm text-gray-500">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} 
                  {selectedTag && ' in selected tag'}
                </div>
              </div>
              
              {tasksLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-gray-600 mt-2">Loading tasks...</p>
                </div>
              )}
              
              {tasksError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600">{tasksError}</p>
                </div>
              )}
              
              {!tasksLoading && filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">No tasks found</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {selectedTag ? 'Try selecting a different tag or create a new task.' : 'Start by creating your first task!'}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    Create First Task
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTasks.map((task: Todo) => (
                    <div
                      key={task._id}
                      className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`text-lg font-medium leading-tight ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.completed && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                              ✓ Done
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {getTagDisplay(task)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full hover:bg-amber-200 transition duration-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleComplete(task)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition duration-200 ${
                              task.completed 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {task.completed ? 'Undo' : 'Complete'}
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition duration-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? handleEditTask : handleAddTask}
          token={token || ''}
          task={editingTask ?? undefined}
        />
      </div>
    </div>
  );
};

export default Dashboard;