/*=================================================================
* Project: AIVA-WEB
* File: Button.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Button component for displaying buttons.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/shared/feedback/LoadingSpinner';
import { 
  useGetTaskQuery, 
  useUpdateTaskMutation,
  useUpdateTaskSubtasksMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation
} from '../redux/slices/api/taskApiSlice';
import { useGetWorkspaceQuery } from '../redux/slices/api/workspaceApiSlice';
import { FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle, FaEdit, FaTrash, FaCheck, FaArrowLeft, FaPlus, FaChevronDown, FaTimes } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentWorkspace, setNavigationState, clearNavigationState } from '../redux/slices/workspaceSlice';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

// Add Task Modal Component
const AddSubtaskModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Subtask title cannot be empty');
      return;
    }
    onAdd(title.trim());
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Subtask</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter subtask title..."
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Subtask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskDetails = () => {
  const { taskId, workspaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector(state => state.workspace);
  const navigationState = useSelector(state => state.workspace.navigationState);
  const [updateTask] = useUpdateTaskMutation();
  const [updateTaskSubtasks] = useUpdateTaskSubtasksMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [task, setTask] = useState(null);
  const [updatingSubtaskIds, setUpdatingSubtaskIds] = useState(new Set());

  const isValidWorkspaceId = Boolean(workspaceId && workspaceId.length === 24);

  // Effect to handle navigation state persistence
  useEffect(() => {
    if (taskId && workspaceId) {
      dispatch(setNavigationState({
        lastPath: location.pathname,
        lastWorkspaceId: workspaceId,
        lastTaskId: taskId
      }));
    }
  }, [taskId, workspaceId, location.pathname, dispatch]);

  // Effect to restore navigation on page load
  useEffect(() => {
    const shouldRestoreNavigation = !taskId && !workspaceId && navigationState?.lastPath;
    if (shouldRestoreNavigation) {
      // Check if the saved state is not too old (e.g., within 24 hours)
      const isStateValid = navigationState.timestamp && 
        (Date.now() - navigationState.timestamp) < 24 * 60 * 60 * 1000;

      if (isStateValid) {

        //console.log('Restoring navigation to:', navigationState.lastPath);

        navigate(navigationState.lastPath, { replace: true });
      } else {
        // Clear expired navigation state
        dispatch(clearNavigationState());
      }
    }
  }, [navigationState, taskId, workspaceId, navigate, dispatch]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Only clear navigation state if navigating away from task details
      if (!location.pathname.includes('/task/')) {
        dispatch(clearNavigationState());
      }
    };
  }, [dispatch, location]);

  // Add workspace query with proper options
  const { data: workspaceData, isLoading: isWorkspaceLoading } = useGetWorkspaceQuery(
    workspaceId,
    { 
      skip: !isValidWorkspaceId,
      refetchOnMountOrArgChange: true
    }
  );

  // Effect to handle workspace persistence
  useEffect(() => {
    if (workspaceData && (!currentWorkspace || currentWorkspace._id !== workspaceId)) {
      // Store workspace data in Redux
      dispatch(setCurrentWorkspace(workspaceData.data || workspaceData));
      
      // Also store in localStorage as backup
      localStorage.setItem('lastWorkspace', JSON.stringify(workspaceData.data || workspaceData));
    }
  }, [workspaceData, currentWorkspace, workspaceId, dispatch]);

  // Effect to restore workspace on page load
  useEffect(() => {
    if (!currentWorkspace && isValidWorkspaceId) {
      // Try to restore from localStorage
      const savedWorkspace = localStorage.getItem('lastWorkspace');
      if (savedWorkspace) {
        try {
          const parsedWorkspace = JSON.parse(savedWorkspace);
          if (parsedWorkspace._id === workspaceId) {
            dispatch(setCurrentWorkspace(parsedWorkspace));
          }
        } catch (error) {

          //console.error('Error parsing saved workspace:', error);

        }
      }
    }
  }, [currentWorkspace, workspaceId, dispatch, isValidWorkspaceId]);

  const { data: taskData, isLoading: isTaskLoading, error, refetch } = useGetTaskQuery(
    { taskId, workspaceId },
    { 
      skip: !taskId || !isValidWorkspaceId,
      refetchOnMountOrArgChange: true
    }
  );

  // Update loading state to include both task and workspace loading
  const isLoading = isTaskLoading || isWorkspaceLoading;

  // Get workspace name and description from the response with proper fallback
  const workspaceInfo = currentWorkspace || workspaceData?.data || workspaceData || {};
  const workspaceName = workspaceInfo?.name || workspaceInfo?.workspace?.name || 'Untitled Workspace';
  const workspaceDescription = workspaceInfo?.description || workspaceInfo?.workspace?.description;

  // For debugging
  useEffect(() => {
    if (workspaceData) {

      // console.log('Workspace Data:', workspaceData);
      // console.log('Workspace Info:', workspaceInfo);
      // console.log('Workspace Name:', workspaceName);
      // console.log('Workspace Description:', workspaceDescription);

    }
  }, [workspaceData, workspaceInfo, workspaceName, workspaceDescription]);

  // Update local task state when data changes
  useEffect(() => {
    if (taskData && !updatingSubtaskIds.size) {
      const currentSubtasks = task?.subtasks || [];
      const newSubtasks = taskData.subtasks || [];
      
      // Deep compare subtasks to check for actual changes
      const subtasksChanged = JSON.stringify(currentSubtasks) !== JSON.stringify(newSubtasks);
      
      // Only update if task is null (initial load) or if subtasks have actually changed
      if (!task || subtasksChanged) {

        setTask(taskData);
      }
    }
  }, [taskData, updatingSubtaskIds, task]);

  // Calculate statistics
  const taskStats = useMemo(() => {
    if (!task?.subtasks) return null;

    const total = task.subtasks.length;
    const completed = task.subtasks.filter(st => st.status === 'completed').length;
    const inProgress = task.subtasks.filter(st => st.status === 'in_progress').length;
    const review = task.subtasks.filter(st => st.status === 'review').length;
    const todo = task.subtasks.filter(st => st.status === 'todo').length;

    return {
      total,
      completed,
      inProgress,
      review,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [task?.subtasks]);

  // Chart data
  const subtaskStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Completed'],
    datasets: [
      {
        data: taskStats ? [
          taskStats.todo,
          taskStats.inProgress,
          taskStats.review,
          taskStats.completed
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red-500
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(168, 85, 247, 0.8)',  // purple-500
          'rgba(16, 185, 129, 0.8)',  // green-500
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)',
          padding: 20,
          font: {
            size: 12
          }
        },
      },
    },
  };

  // Handle invalid IDs with more specific error messages
  if (!taskId || !isValidWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid ID Format</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {!taskId 
              ? `Invalid task ID format: ${taskId}` 
              : `Invalid workspace ID format: ${workspaceId}`}
          </p>
        </div>
        <button
          onClick={() => {
            const targetPath = `/workspace/${workspaceId}/tasks`;

            //console.log('Navigating to:', targetPath); // Debug log

            navigate(targetPath, { replace: true });
          }}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft /> Return to Tasks
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Task</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error?.data?.message || 'Unable to load task details'}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              const targetPath = `/workspace/${workspaceId}/tasks`;

              //console.log('Navigating to:', targetPath); // Debug log

              navigate(targetPath, { replace: true });
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <FaArrowLeft /> Return to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-gray-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p>The requested task could not be found.</p>
        </div>
        <button
          onClick={() => {
            const targetPath = `/workspace/${workspaceId}/tasks`;

            //console.log('Navigating to:', targetPath); // Debug log

            navigate(targetPath, { replace: true });
          }}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft /> Return to Tasks
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({
        taskId,
        workspaceId,
        updates: { stage: newStatus }
      }).unwrap();
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleAddSubtask = async (title) => {
    if (!title.trim()) {
      toast.error('Subtask title cannot be empty');
      return;
    }

    try {
      await createSubtask({
        taskId,
        workspaceId,
        title: title.trim()
      }).unwrap();
      
      toast.success('Subtask added successfully');
      refetch();
    } catch (error) {

      toast.error(error?.data?.message || 'Failed to add subtask');
    }
  };

  const handleSubtaskStatusToggle = async (subtaskId) => {
    if (!subtaskId || updatingSubtaskIds.has(subtaskId)) {
      return;
    }

    try {
      setUpdatingSubtaskIds(prev => new Set([...prev, subtaskId]));
      
      const subtask = task.subtasks.find(st => st._id === subtaskId);
      if (!subtask) {
        toast.error('Subtask not found');
        return;
      }

      const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
      
      // First update the local state optimistically
      const updatedSubtasks = task.subtasks.map(st => 
        st._id === subtaskId ? { ...st, status: newStatus } : st
      );
      setTask(prev => ({ ...prev, subtasks: updatedSubtasks }));

      // Then send the update to the server
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks
      }).unwrap();

      toast.success(`Subtask marked as ${newStatus}`);
    } catch (error) {
      // Revert the optimistic update on error
      setTask(taskData);

      //console.error('Error toggling subtask status:', error);

      toast.error(error?.data?.message || 'Failed to update subtask status');
    } finally {
      setUpdatingSubtaskIds(prev => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }
  };

  const handleEditSubtask = async (subtaskId) => {
    if (!editValue.trim()) {
      toast.error('Subtask title cannot be empty');
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map(st =>
        st._id === subtaskId ? { ...st, title: editValue.trim() } : st
      );

      // First update the local state optimistically
      setTask(prev => ({ ...prev, subtasks: updatedSubtasks }));

      // Then send the update to the server
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks
      }).unwrap();

      toast.success('Subtask updated successfully');
      setEditingSubtask(null);
      setEditValue('');
    } catch (error) {
      // Revert the optimistic update on error
      setTask(taskData);

      //console.error('Error updating subtask:', error);

      toast.error(error?.data?.message || 'Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const updatedSubtasks = task.subtasks.filter(st => st._id !== subtaskId);
      
      // First update the local state optimistically
      setTask(prev => ({ ...prev, subtasks: updatedSubtasks }));

      // Then send the update to the server
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks
      }).unwrap();

      toast.success('Subtask deleted successfully');
    } catch (error) {
      // Revert the optimistic update on error
      setTask(taskData);

      //console.error('Error deleting subtask:', error);

      toast.error(error?.data?.message || 'Failed to delete subtask');
    }
  };

  // Update the status change handler in the JSX
  const handleSubtaskStatusChange = async (subtaskId, newStatus) => {
    try {
      const updatedSubtasks = task.subtasks.map(st =>
        st._id === subtaskId ? { ...st, status: newStatus } : st
      );

      // First update the local state optimistically
      setTask(prev => ({ ...prev, subtasks: updatedSubtasks }));

      // Then send the update to the server
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks
      }).unwrap();

      toast.success(`Subtask status updated to ${newStatus}`);
    } catch (error) {
      // Revert the optimistic update on error
      setTask(taskData);
      toast.error('Failed to update subtask status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const targetPath = `/workspace/${workspaceId}/tasks`;

              //console.log('Navigating to:', targetPath); // Debug log

              navigate(targetPath, { replace: true });
            }}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to {workspaceName}
          </button>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">
              Workspace: {workspaceName}
            </span>
            {workspaceDescription && (
              <span className="text-xs text-gray-400 dark:text-gray-500 block mt-1">
                {workspaceDescription}
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h1>
            
            {task.description && (
              <p className="text-gray-600 dark:text-gray-300">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <select
                  value={task.stage}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <span className={`px-2 py-1 text-xs rounded-full ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Task Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completion Rate
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {taskStats?.completionRate || 0}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Subtasks
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {taskStats?.total || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In Progress
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {taskStats?.inProgress || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {taskStats?.completed || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Subtask Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Subtask Distribution
          </h2>
          <div className="h-64">
            <Pie data={subtaskStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Subtasks
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            <FaPlus className="w-3 h-3" /> Add Subtask
          </button>
        </div>
        
        {task.subtasks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask._id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col h-full">
                  {/* Header with Status and Actions */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleSubtaskStatusToggle(subtask._id)}
                      disabled={updatingSubtaskIds.has(subtask._id)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        updatingSubtaskIds.has(subtask._id)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                        } ${
                          subtask.status === 'completed'
                            ? 'border-green-500 bg-green-500 hover:bg-green-600'
                            : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {subtask.status === 'completed' && (
                        <FaCheck className={`w-3 h-3 ${
                          updatingSubtaskIds.has(subtask._id) ? 'text-white/70' : 'text-white'
                        }`} />
                      )}
                      {updatingSubtaskIds.has(subtask._id) && subtask.status !== 'completed' && (
                        <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {editingSubtask !== subtask._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingSubtask(subtask._id);
                              setEditValue(subtask.title);
                            }}
                            className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubtask(subtask._id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title/Edit Section */}
                  <div className="flex-grow">
                    {editingSubtask === subtask._id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleEditSubtask(subtask._id)}
                          placeholder="Enter subtask title..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubtask(subtask._id)}
                            className="flex-1 px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubtask(null);
                              setEditValue('');
                            }}
                            className="flex-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm mb-3 ${
                        subtask.status === 'completed'
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {subtask.title}
                      </p>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="relative mt-3">
                    <select
                      value={subtask.status || 'todo'}
                      onChange={(e) => handleSubtaskStatusChange(subtask._id, e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none transition-colors duration-200"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <FaChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No subtasks available</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FaPlus className="w-4 h-4" /> Create your first subtask
            </button>
          </div>
        )}
      </div>

      {/* Add Subtask Modal */}
      <AddSubtaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubtask}
      />
    </div>
  );
};

export default TaskDetails;