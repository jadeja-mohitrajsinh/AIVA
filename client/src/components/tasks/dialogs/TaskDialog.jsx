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
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useWorkspace } from '../../workspace/provider/WorkspaceProvider';
import { useUpdateTaskMutation } from '../../../redux/slices/api/taskApiSlice';
import { addNotification } from '../../../redux/slices/notificationSlice';
import { Modal } from '../../shared/dialog/Modal';
import { Input } from '../../shared/inputs/Input';
import { Select } from '../../shared/inputs/Select';
import { Button } from '../../shared/buttons/Button';
import UserList from '../shared/UserList';

const TaskDialog = ({ isOpen, onClose, task, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { workspace } = useWorkspace();
  const [updateTask] = useUpdateTaskMutation();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      stage: task?.stage || 'todo',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        stage: task.stage,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      setSelectedMembers(task.assignees || []);
    }
  }, [task, reset]);

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await updateTask({
        taskId: task._id,
        workspaceId: workspace._id,
        updates: {
          ...data,
          assignees: selectedMembers.map(member => member._id)
        }
      }).unwrap();

      dispatch(addNotification({
        title: 'Task Updated',
        message: `Task "${data.title}" has been updated successfully.`,
        type: 'success'
      }));

      onSuccess?.(result);
      handleClose();
    } catch (error) {

      //console.error('Failed to update task:', error);
      dispatch(addNotification({
        title: 'Task Update Failed',
        message: error?.data?.message || 'Failed to update task. Please try again.',
        type: 'error'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const stageOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleUserSelect = (user) => {
    setSelectedMembers(prev => {
      const exists = prev.some(member => member._id === user._id);
      if (exists) {
        return prev.filter(member => member._id !== user._id);
      }
      return [...prev, user];
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? 'Edit Task' : 'Create Task'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          required
        />
        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
        />
        <Select
          label="Priority"
          {...register('priority')}
          error={errors.priority?.message}
          options={priorityOptions}
        />
        <Select
          label="Stage"
          {...register('stage')}
          error={errors.stage?.message}
          options={stageOptions}
        />
        <Input
          type="date"
          label="Due Date"
          {...register('dueDate', { required: 'Due date is required' })}
          error={errors.dueDate?.message}
          required
        />
        <UserList
          selectedUsers={selectedMembers}
          onUserSelect={handleUserSelect}
        />
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskDialog; 