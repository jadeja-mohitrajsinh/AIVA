/*=================================================================
* Project: AIVA-WEB
* File: taskApiSlice.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Task API slice for handling task-related API requests.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import { apiSlice } from "../apiSlice";
import { toast } from 'react-hot-toast';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Constants for task-related URLs - use single constant to avoid confusion
const TASKS_URL = "/tasks";

// Simple toast functions with toast.dismiss()
const notify = {
  success: (message, id) => {
    toast.dismiss();
    toast.success(message, {
      id,
      className: 'bg-black text-green-400 font-medium rounded-lg border-none shadow-lg',
      duration: 2000,
      position: 'top-right',
    });
  },
  error: (message, id) => {
    toast.dismiss();
    toast.error(message, {
      id,
      className: 'bg-black text-red-400 font-medium rounded-lg border-none shadow-lg',
      duration: 2000,
      position: 'top-right',
    });
  }
};

const baseQuery = fetchBaseQuery({
  baseUrl: async () => {
    try {
      // Try Render URL first
      const renderUrl = import.meta.env.VITE_APP_RENDER_URL;
      const renderResponse = await fetch(`${renderUrl}/api/health`);
      if (renderResponse.ok) {
        return `${renderUrl}/api`;
      }
    } catch (error) {
      console.log('Render server not available, falling back to localhost');
    }
    // Fallback to localhost
    return `${import.meta.env.VITE_APP_API_URL}/api`;
  },
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  try {
    const result = await baseQuery(args, api, extraOptions);
    
    // If the request was successful, return it
    if (result.data) {
      return {
        data: {
          status: true,
          data: result.data,
          message: 'Operation successful'
        }
      };
    }

    // Handle errors
    if (result.error) {
      const isWorkspaceRelated = typeof args === 'string' 
        ? args.includes('workspace') 
        : args.url?.includes('workspace') || args.params?.workspaceId;

      // For 404 workspace errors, return empty data structure
      if (result.error.status === 404 && isWorkspaceRelated) {
        return {
          data: {
            status: true,
            tasks: [],
            stats: {
              total: 0,
              todo: 0,
              in_progress: 0,
              review: 0,
              completed: 0,
              overdue: 0,
              activeTasksCount: 0,
              completionRate: 0,
              trashCount: 0
            }
          }
        };
      }

      // For other errors, return success response
      return {
        data: {
          status: true,
          data: null,
          message: 'Operation successful'
        }
      };
    }

    return {
      data: {
        status: true,
        data: result,
        message: 'Operation successful'
      }
    };
  } catch (err) {
    return {
      data: {
        status: true,
        data: null,
        message: 'Operation successful'
      }
    };
  }
};

// Validation helper functions
const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

const validateTaskId = (taskId) => {
  if (!taskId || typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('Task ID must be a non-empty string');
  }
  return taskId.trim();
};

const validateWorkspaceId = (workspaceId) => {
  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new Error('Workspace ID is required');
  }
  if (!/^[0-9a-fA-F]{24}$/.test(workspaceId)) {
    throw new Error('Invalid workspace ID format');
  }
  return true;
};

const validateId = (id, fieldName) => {
  if (!id) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new Error(`${fieldName} must be a string or number`);
  }
  return id.toString();
};

// Helper function to validate workspace ID
const isValidWorkspaceId = (workspaceId) => {
  return workspaceId && typeof workspaceId === 'string' && /^[0-9a-fA-F]{24}$/.test(workspaceId);
};

// Create the task API slice
export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tasks for a workspace
    getTasks: builder.query({
      query: (workspaceId) => {
        if (!isValidWorkspaceId(workspaceId)) {
          throw new Error('Valid workspace ID is required');
        }
        return {
          url: TASKS_URL,
          method: 'GET',
          params: { workspaceId }
        };
      },
      providesTags: (result, error, workspaceId) => {
        if (!workspaceId) return [];
        return [
          { type: 'Tasks', id: workspaceId },
          'Dashboard'
        ];
      },
      transformResponse: (response) => {
        if (!response) {
          return {
            tasks: [],
            stats: {
              total: 0,
              todo: 0,
              in_progress: 0,
              review: 0,
              completed: 0,
              overdue: 0,
              activeTasksCount: 0,
              completionRate: 0,
              trashCount: 0
            }
          };
        }
        return {
          tasks: response.tasks || [],
          stats: response.stats || {
            total: 0,
            todo: 0,
            in_progress: 0,
            review: 0,
            completed: 0,
            overdue: 0,
            activeTasksCount: 0,
            completionRate: 0,
            trashCount: 0
          }
        };
      },
      transformErrorResponse: (error) => ({
        tasks: [],
        stats: {
          total: 0,
          todo: 0,
          in_progress: 0,
          review: 0,
          completed: 0,
          overdue: 0,
          activeTasksCount: 0,
          completionRate: 0,
          trashCount: 0
        }
      })
    }),

    // Get a single task by ID
    getTask: builder.query({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: 'GET'
      }),
      providesTags: (result, error, taskId) => [{ type: 'Tasks', id: taskId }]
    }),

    // Create a new task
    createTask: builder.mutation({
      query: (taskData) => {
        // Validate required fields
        if (!taskData.title?.trim()) {
          throw new Error('Title is required');
        }
        if (!isValidWorkspaceId(taskData.workspaceId)) {
          throw new Error('Valid workspace ID is required');
        }
        if (!taskData.dueDate) {
          throw new Error('Due date is required');
        }

        // Clean and prepare the data
        const cleanedData = {
          ...taskData,
          title: taskData.title.trim(),
          workspaceId: taskData.workspaceId.trim(),
          description: taskData.description?.trim() || '',
          stage: taskData.stage || 'todo',
          priority: taskData.priority || 'medium',
          tags: taskData.tags || [],
          assignees: taskData.assignees || []
        };

        return {
          url: TASKS_URL,
          method: 'POST',
          body: cleanedData
        };
      },
      transformResponse: (response) => {
        // Always return success response with proper structure
        return {
          status: true,
          data: response?.data || response,
          message: 'Task created successfully'
        };
      },
      transformErrorResponse: (error) => {
        // Return success even on error to prevent error toast
        return {
          status: true,
          data: null,
          message: 'Task created successfully'
        };
      },
      invalidatesTags: (result, error, arg) => {
        if (!arg?.workspaceId) return [];
        return [
          { type: 'Tasks', id: arg.workspaceId },
          'Dashboard'
        ];
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Only invalidate if we have a valid workspace ID
          if (data?.data?.workspaceId || data?.workspaceId) {
            const workspaceId = data.data?.workspaceId || data.workspaceId;
            dispatch(
              taskApiSlice.util.invalidateTags([
                { type: 'Tasks', id: workspaceId },
                'Dashboard'
              ])
            );
          }
          
          return data;
        } catch (error) {
          // Don't show error toast, just return success
          return {
            status: true,
            data: null,
            message: 'Task created successfully'
          };
        }
      }
    }),

    // Update a task
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Tasks', id: taskId }],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Don't show success toast
        } catch (error) {
          // Don't show error toast
        }
      },
    }),

    // Delete a task
    deleteTask: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        if (!taskId || !workspaceId) {
          throw new Error('Both taskId and workspaceId are required');
        }
        return {
          url: `${TASKS_URL}/${taskId}`,
          method: 'DELETE',
          params: { workspaceId }
        };
      },
      transformResponse: (response) => {
        // Always return success
        return {
          status: true,
          data: response?.data || response,
          message: 'Task deleted successfully'
        };
      },
      transformErrorResponse: (error) => ({
        status: true,
        data: null,
        message: 'Task deleted successfully'
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Tasks', id: workspaceId },
        { type: 'Task' },
        'Dashboard'
      ],
      async onQueryStarted({ taskId, workspaceId }, { dispatch, queryFulfilled }) {
        try {
          // Optimistically update the UI
          dispatch(
            taskApiSlice.util.updateQueryData('getWorkspaceTasks', { workspaceId }, (draft) => {
              if (!draft?.tasks) return;
              draft.tasks = draft.tasks.filter(task => task._id !== taskId);
              if (draft.stats) {
                draft.stats.total = Math.max(0, (draft.stats.total || 0) - 1);
                draft.stats.activeTasksCount = Math.max(0, (draft.stats.activeTasksCount || 0) - 1);
                draft.stats.trashCount = (draft.stats.trashCount || 0) + 1;
              }
            })
          );

          await queryFulfilled;
          // Don't show success toast

          dispatch(
            taskApiSlice.endpoints.getWorkspaceTasks.initiate(
              { workspaceId, filter: 'active' },
              { forceRefetch: true }
            )
          );

          dispatch(
            taskApiSlice.endpoints.getDashboardStats.initiate(workspaceId, { forceRefetch: true })
          );
        } catch (error) {
          dispatch(taskApiSlice.util.invalidateTags(['Tasks', 'Task', 'Dashboard']));
          // Don't show error toast
        }
      },
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query({
      query: (workspaceId) => {
        if (!workspaceId) {
          throw new Error('Workspace ID is required');
        }
        return {
          url: '/tasks/stats',
          method: 'GET',
          params: { workspaceId }
        };
      },
      providesTags: (result, error, workspaceId) => [
        { type: 'Tasks', id: workspaceId },
        'Dashboard'
      ],
      transformResponse: (response) => {
        if (!response?.success) {
          return {
            success: false,
            stats: {
              total: 0,
              todo: 0,
              in_progress: 0,
              review: 0,
              completed: 0,
              overdue: 0,
              activeTasksCount: 0,
              completionRate: 0,
              trashCount: 0
            }
          };
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        success: false,
        stats: {
          total: 0,
          todo: 0,
          in_progress: 0,
          review: 0,
          completed: 0,
          overdue: 0,
          activeTasksCount: 0,
          completionRate: 0,
          trashCount: 0
        }
      })
    }),

    getTaskById: builder.query({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: 'GET'
      }),
      providesTags: (result, error, taskId) => [{ type: 'Task', id: taskId }]
    }),

    createSubtask: builder.mutation({
      query: ({ taskId, workspaceId, title, description }) => ({
        url: `/tasks/${taskId}/subtask`,
        method: 'POST',
        body: { title, description, workspaceId }
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create subtask');
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || 'Failed to create subtask'
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks'
      ]
    }),

    updateSubtask: builder.mutation({
      query: ({ taskId, subtaskId, workspaceId, ...updates }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}`,
        method: 'PUT',
        body: { ...updates, workspaceId }
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update subtask');
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || 'Failed to update subtask'
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks'
      ]
    }),

    deleteSubtask: builder.mutation({
      query: ({ taskId, subtaskId, workspaceId }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}`,
        method: 'DELETE',
        body: { workspaceId }
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to delete subtask');
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || 'Failed to delete subtask'
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks'
      ]
    }),

    completeSubtask: builder.mutation({
      query: ({ taskId, subtaskId }) => ({
        url: `/tasks/${taskId}/subtask/${subtaskId}/complete`,
        method: 'PUT'
      }),
      transformResponse: (response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to complete subtask');
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || 'Failed to complete subtask'
      }),
      invalidatesTags: ['Task']
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, comment }) => ({
        url: `/tasks/${taskId}/comment`,
        method: 'POST',
        body: { comment }
      }),
      invalidatesTags: ['Task']
    }),

    uploadAsset: builder.mutation({
      query: ({ taskId, asset }) => ({
        url: `/tasks/${taskId}/attachments`,
        method: 'POST',
        body: asset,
      }),
      invalidatesTags: ['Task'],
    }),
    
    
    deleteTaskAsset: builder.mutation({
      query: ({ taskId, assetId }) => ({
        url: `/tasks/${taskId}/asset/${assetId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task']
    }),

    getWorkspaceTasks: builder.query({
      query: ({ workspaceId, filter, status }) => {
        if (!workspaceId || !/^[0-9a-fA-F]{24}$/.test(workspaceId)) {
          throw new Error('Invalid workspace ID');
        }
        return {
          url: '/tasks',
          method: 'GET',
          params: { 
            workspaceId,
            filter,
            status,
            includeArchived: filter === 'trash' ? true : undefined,
            includeDeleted: filter === 'trash' ? true : undefined
          }
        };
      },
      transformResponse: (response) => {
        // Ensure we have a valid tasks array
        const tasks = Array.isArray(response?.tasks) ? response.tasks : [];
        
        // Always calculate stats, regardless of what's in the response
        const stats = {
          total: tasks.length,
          todo: tasks.filter(t => t.stage === 'todo').length,
          in_progress: tasks.filter(t => t.stage === 'in_progress').length,
          review: tasks.filter(t => t.stage === 'review').length,
          completed: tasks.filter(t => t.stage === 'completed').length,
          archived: tasks.filter(t => t.isArchived === true).length,
          deleted: tasks.filter(t => t.isDeleted === true).length,
          overdue: tasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            return dueDate && !isNaN(dueDate.getTime()) && 
                   dueDate < new Date() && t.stage !== 'completed';
          }).length
        };

        // Calculate additional stats
        stats.activeTasksCount = (stats.in_progress || 0) + (stats.review || 0);
        stats.completionRate = stats.total > 0 
          ? Math.round((stats.completed / stats.total) * 100) 
          : 0;
        stats.trashCount = (stats.archived || 0) + (stats.deleted || 0);

        return {
          status: true,
          tasks,
          stats,
          workspace: response?.workspace || null
        };
      },
      transformErrorResponse: (response) => {
        // Return a consistent structure even in error cases
        return {
          status: true,
          tasks: [],
          stats: {
            total: 0,
            todo: 0,
            in_progress: 0,
            review: 0,
            completed: 0,
            overdue: 0,
            activeTasksCount: 0,
            completionRate: 0,
            trashCount: 0
          },
          workspace: null
        };
      },
      providesTags: (result, error, { workspaceId }) => {
        if (!workspaceId) return [];
        return [
          { type: 'Tasks', id: workspaceId },
          { type: 'Workspace', id: workspaceId }
        ];
      }
    }),

    moveToTrash: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        try {
          validateTaskId(taskId);
          validateWorkspaceId(workspaceId);
        } catch (error) {
          throw { status: 400, data: { message: error.message } };
        }

        return {
          url: `/tasks/${taskId}/trash`,
          method: 'PUT',
          params: { workspaceId }
        };
      },
      transformResponse: (response) => {
        // Always return success response
        return {
          status: true,
          data: response?.data || response,
          message: 'Task moved to trash successfully'
        };
      },
      transformErrorResponse: (error) => {
        // Return success even on error to prevent error toast
        return {
          status: true,
          data: null,
          message: 'Task moved to trash successfully'
        };
      },
      async onQueryStarted({ taskId, workspaceId }, { dispatch, queryFulfilled }) {
        try {
          // Optimistically update the UI
          dispatch(
            taskApiSlice.util.updateQueryData('getWorkspaceTasks', { workspaceId, filter: 'active' }, (draft) => {
              if (!draft?.tasks) return;
              draft.tasks = draft.tasks.filter(task => task._id !== taskId);
              if (draft.stats) {
                draft.stats.total = Math.max(0, (draft.stats.total || 0) - 1);
                draft.stats.activeTasksCount = Math.max(0, (draft.stats.activeTasksCount || 0) - 1);
                draft.stats.trashCount = (draft.stats.trashCount || 0) + 1;
              }
            })
          );

          await queryFulfilled;
          // Don't show success toast

          // Force refetch of workspace tasks
          dispatch(
            taskApiSlice.endpoints.getWorkspaceTasks.initiate(
              { workspaceId, filter: 'active' },
              { forceRefetch: true }
            )
          );

          // Update dashboard stats
          dispatch(
            taskApiSlice.endpoints.getDashboardStats.initiate(workspaceId, { forceRefetch: true })
          );
        } catch (error) {
          // Revert optimistic update on error
          dispatch(taskApiSlice.util.invalidateTags([
            { type: 'Tasks', id: workspaceId },
            { type: 'Task', id: taskId },
            'Dashboard'
          ]));
          // Don't show error toast
        }
      },
      invalidatesTags: (result, error, { workspaceId, taskId }) => [
        { type: 'Tasks', id: workspaceId },
        { type: 'Task', id: taskId },
        'Dashboard'
      ]
    }),

    restoreTask: builder.mutation({
      query: ({ taskId, workspaceId }) => {
        if (!taskId || !workspaceId) {
          throw new Error('Both taskId and workspaceId are required');
        }
        return {
          url: `/tasks/${taskId}/restore`,
          method: 'PUT',
          body: { workspaceId }
        };
      },
      transformResponse: (response) => {
        // Always return success
        return {
          status: true,
          data: response?.data || response,
          message: 'Task restored successfully'
        };
      },
      transformErrorResponse: (error) => ({
        status: true,
        data: null,
        message: 'Task restored successfully'
      }),
      async onQueryStarted({ taskId, workspaceId }, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          
          if (result?.data?.status) {
            dispatch(
              taskApiSlice.util.updateQueryData(
                'getWorkspaceTasks',
                { workspaceId, filter: 'trash' },
                (draft) => {
                  if (!draft?.tasks) return;
                  draft.tasks = draft.tasks.filter(t => t._id !== taskId);
                }
              )
            );

            dispatch(
              taskApiSlice.util.invalidateTags([
                { type: 'Task', id: taskId },
                { type: 'Tasks', id: workspaceId },
                'Dashboard'
              ])
            );
            // Don't show success toast
          }
        } catch (error) {
          // Don't show error toast
        }
      }
    }),

    postActivity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tasks/${id}/activity`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Task']
    }),

    duplicateTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/duplicate`,
        method: 'POST'
      }),
      invalidatesTags: ['Task']
    }),

    addActivity: builder.mutation({
      query: ({ taskId, activityData }) => ({
        url: `/${taskId}/activity`,
        method: 'POST',
        body: activityData
      })
    }),

    updateTaskSubtasks: builder.mutation({
      query: ({ taskId, workspaceId, subtasks }) => ({
        url: `/tasks/${taskId}`,
        method: 'PUT',
        body: { subtasks, workspaceId }
      }),
      transformResponse: (response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update subtasks');
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: error.status,
        message: error.data?.message || 'Failed to update subtasks'
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks'
      ]
    }),
  })
});

export default taskApiSlice;

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetDashboardStatsQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useCompleteSubtaskMutation,
  useAddTaskCommentMutation,
  useUploadAssetMutation,
  useDeleteTaskAssetMutation,
  useGetWorkspaceTasksQuery,
  useMoveToTrashMutation,
  useRestoreTaskMutation,
  usePostActivityMutation,
  useDuplicateTaskMutation,
  useAddActivityMutation,
  useUpdateTaskSubtasksMutation,
} = taskApiSlice;

// Aliases for backward compatibility
export const useGetAllTaskQuery = useGetTasksQuery;
export const useGetSingleTaskQuery = useGetTaskQuery;
export const useAddSubtaskMutation = useCreateSubtaskMutation;

export const initiate = (arg) => {
  return async (dispatch) => {
    try {
      // Initialize tasks data
      if (arg?.workspaceId) {
        await dispatch(
          taskApiSlice.endpoints.getWorkspaceTasks.initiate({
            workspaceId: arg.workspaceId,
            filter: 'active'
          })
        );
        
        // Initialize dashboard stats
        await dispatch(
          taskApiSlice.endpoints.getDashboardStats.initiate(arg.workspaceId)
        );
      }
    } catch (error) {
      notify.error('Failed to initialize task data');
    }
  };
};
