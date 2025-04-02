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
import { addNotification } from '../slices/notificationSlice';

const isDueDateWithin24Hours = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffInHours = (due - now) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 24;
};

export const notificationMiddleware = store => next => action => {
  const result = next(action);

  // Handle task-related actions
  if (action.type.startsWith('taskApi/')) {
    const { type, payload } = action;

    // Task creation success
    if (type === 'taskApi/executeMutation/fulfilled' && payload?.title) {
      store.dispatch(addNotification({
        title: 'Task Created',
        message: `Task "${payload.title}" has been created successfully.`,
        type: 'success'
      }));

      // Check due date
      if (isDueDateWithin24Hours(payload.dueDate)) {
        store.dispatch(addNotification({
          title: 'Due Soon',
          message: `Task "${payload.title}" is due within 24 hours.`,
          type: 'warning'
        }));
      }
    }

    // Task update success
    if (type === 'taskApi/executeMutation/fulfilled' && payload?.title) {
      store.dispatch(addNotification({
        title: 'Task Updated',
        message: `Task "${payload.title}" has been updated successfully.`,
        type: 'success'
      }));

      // Check due date after update
      if (isDueDateWithin24Hours(payload.dueDate)) {
        store.dispatch(addNotification({
          title: 'Due Soon',
          message: `Task "${payload.title}" is due within 24 hours.`,
          type: 'warning'
        }));
      }
    }

    // Task deletion success
    if (type === 'taskApi/executeMutation/fulfilled' && action.meta?.arg?.type === 'deleteTask') {
      store.dispatch(addNotification({
        title: 'Task Deleted',
        message: 'Task has been deleted successfully.',
        type: 'success'
      }));
    }

    // Task assignment success
    if (type === 'taskApi/executeMutation/fulfilled' && action.meta?.arg?.type === 'assignTask') {
      store.dispatch(addNotification({
        title: 'Task Assigned',
        message: `Task has been assigned to ${payload.assignees?.length} member(s).`,
        type: 'success'
      }));
    }

    // Task status change success
    if (type === 'taskApi/executeMutation/fulfilled' && action.meta?.arg?.type === 'updateTaskStatus') {
      store.dispatch(addNotification({
        title: 'Task Status Updated',
        message: `Task status has been updated to "${payload.status}".`,
        type: 'success'
      }));
    }

    // Handle errors
    if (type.endsWith('/rejected')) {
      store.dispatch(addNotification({
        title: 'Operation Failed',
        message: action.error?.message || 'An error occurred while processing your request.',
        type: 'error'
      }));
    }
  }

  return result;
};

export default notificationMiddleware; 