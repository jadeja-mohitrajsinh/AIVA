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
import React, { useState, useCallback } from 'react';
import { useGetWorkspaceTasksQuery } from '../../../redux/slices/api/taskApiSlice';
import { useGetWorkspaceMembersQuery } from '../../../redux/slices/api/workspaceApiSlice';
import TaskCard from '../cards/TaskCard';
import { LoadingSpinner } from '../../shared/feedback/LoadingSpinner';
import { useWorkspace } from '../../workspace/provider/WorkspaceProvider';
import { toast } from 'sonner';
import TaskDialog from '../dialogs/TaskDialog';
import { Button } from '../../shared/buttons/Button';
import { FaTasks, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../shared/cards/StatCard';
import EmptyState from '../../shared/EmptyState';
import Spinner from '../../shared/Spinner';
import AddTask from '../dialogs/AddTask';


const TaskList = ({ tasks = [], showBudgetDetails = false, workspace }) => {
  const [filter, setFilter] = useState('active');
  const { workspace: workspaceContext, isLoading: isWorkspaceLoading, error: workspaceError } = useWorkspace();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const navigate = useNavigate();

  // Get workspace member role - only if we have a workspace with an ID
  const { data: workspaceData, isLoading: isMembersLoading, error: membersError } = useGetWorkspaceMembersQuery(
    workspaceContext?._id,
    {
      skip: !workspaceContext?._id || isWorkspaceLoading
    }
  );
  
  // Check if user is a member or admin
  const userRole = workspaceData?.userRole || workspaceContext?.userRole || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'owner' || workspaceContext?.owner?._id === workspaceContext?.currentUser;
  
  const { data, isLoading: isTasksLoading, error: tasksError, refetch } = useGetWorkspaceTasksQuery({ 
    workspaceId: workspaceContext?._id,
    filter
  }, {
    skip: !workspaceContext?._id || isWorkspaceLoading,
    refetchOnMountOrArgChange: true,
    pollingInterval: 5000
  });

  const tasksFromData = data?.tasks || [];
  const stats = data?.stats || {};

  // Handle task update
  const handleTaskUpdate = useCallback(async () => {
    if (!workspaceContext?._id) return;
    
    try {
      await refetch();
    } catch (err) {
      toast.error('Failed to refresh tasks');
    }
  }, [workspaceContext?._id, refetch]);

  // Handle filter change
  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    try {
      await refetch();
    } catch (err) {
      toast.error('Failed to refresh tasks');
    }
  };

  // Add task success handler
  const handleAddTaskSuccess = useCallback(() => {
    setIsAddTaskOpen(false);
    refetch(); // Refresh tasks and stats
  }, [refetch]);

  // Show loading state when workspace is loading
  if (isWorkspaceLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading workspace...</span>
      </div>
    );
  }

  // Show workspace error state
  if (workspaceError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{workspaceError.message || 'Failed to load workspace'}</p>
        {workspaceError.status === 403 && (
          <p className="mt-2 text-sm">You do not have permission to access this workspace.</p>
        )}
      </div>
    );
  }

  // Show workspace selection message if no workspace is selected
  if (!workspaceContext || !workspaceContext._id) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        <p>Please select a workspace from the sidebar to view tasks</p>
        <p className="mt-2 text-sm">You can find your workspaces in the sidebar on the left</p>
      </div>
    );
  }

  // Show loading state when fetching members or tasks
  if (isMembersLoading || isTasksLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  // Show error state if there's an error loading tasks
  if (tasksError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{tasksError.data?.message || 'Failed to load tasks'}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Create Task
        </button>
      </div>

      

      {/* Task List */}
      <div className="mt-4">
        {isTasksLoading ? (
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : tasksError ? (
          <div className="text-center text-red-600 dark:text-red-400">
            {tasksError.data?.message || 'Failed to load tasks'}
          </div>
        ) : tasksFromData.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Get started by creating a new task"
            action={
              <Button
                label="Create Task"
                onClick={() => setIsAddTaskOpen(true)}
                variant="primary"
                icon={<FaTasks />}
              />
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksFromData.map((task) => (
              <TaskCard key={task._id} task={task} onUpdate={handleTaskUpdate} />
            ))}
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <AddTask
        isOpen={isAddTaskOpen}
        setOpen={setIsAddTaskOpen}
        onSuccess={handleAddTaskSuccess}
      />
    </div>
  );
};

TaskList.displayName = 'TaskList';
export { TaskList };
export default TaskList; 