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
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '../../shared/buttons/Button';
import { Input } from '../../shared/inputs/Input';
import { useWorkspace } from '../../workspace/provider/WorkspaceProvider';
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../../redux/slices/api/taskApiSlice';
import { toast } from 'sonner';
import UserList from '../shared/UserList';
import { MdClose } from 'react-icons/md';

const AddTask = ({ isOpen, setOpen, onSuccess, taskType = 'default' }) => {
  const { workspace } = useWorkspace();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    stage: 'todo',
    dueDate: '',
    assignees: [],
    // Budget specific fields
    amount: '',
    category: '',
    frequency: 'one-time',
    budgetType: 'expense',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Budget specific validations
    if (taskType === 'budget') {
      if (!formData.amount || isNaN(formData.amount)) {
        newErrors.amount = 'Valid amount is required';
      }
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
      if (formData.frequency === 'recurring' && (!formData.startDate || !formData.endDate)) {
        newErrors.dateRange = 'Start and end dates are required for recurring items';
      }
    }

    // Workspace validation
    if (!workspace?._id) {
      newErrors.workspace = 'Please select a workspace';
      toast.error('Please select a workspace first');
    }

    // Show all validation errors
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        toast.error(error);
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workspace?._id) {
      toast.error('Please select a workspace first');
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Close dialog immediately
    setOpen(false);

    // Reset form data
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      stage: 'todo',
      dueDate: '',
      assignees: [],
      amount: '',
      category: '',
      frequency: 'one-time',
      budgetType: 'expense',
      startDate: '',
      endDate: '',
      notes: ''
    });
    
    // Reset other states
    setSelectedMembers([]);
    setErrors({});

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        stage: formData.stage,
        dueDate: new Date(formData.dueDate).toISOString(),
        workspaceId: workspace._id,
        assignees: selectedMembers,
        taskType,
        ...(taskType === 'budget' && {
          budgetDetails: {
            amount: parseFloat(formData.amount),
            category: formData.category,
            frequency: formData.frequency,
            budgetType: formData.budgetType,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            notes: formData.notes
          }
        })
      };

      const result = await createTask(taskData).unwrap();
      
      if (result?.status) {
        // Show success message
        toast.success('Task created successfully');
        
        // Call success callback after a short delay
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      }
    } catch (error) {
      // Show error message
      toast.error(error?.data?.message || 'Failed to create task');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      stage: 'todo',
      dueDate: '',
      assignees: [],
      amount: '',
      category: '',
      frequency: 'one-time',
      budgetType: 'expense',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setSelectedMembers([]);
    setErrors({});
  };

  const budgetCategories = [
    'Income',
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Debt Payments',
    'Savings',
    'Entertainment',
    'Shopping',
    'Education',
    'Investments',
    'Other'
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleClose}
        open={isOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {taskType === 'budget' ? 'Add Budget Item' : 'Create New Task'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <MdClose className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <Input
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                      placeholder={taskType === 'budget' ? 'Enter budget item title' : 'Enter task title'}
                    />
                  </div>

                  {taskType === 'budget' && (
                    <>
                      {/* Amount Field */}
                      <div>
                        <Input
                          label="Amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={handleChange}
                          error={errors.amount}
                          required
                          placeholder="Enter amount"
                        />
                      </div>

                      {/* Category Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {budgetCategories.map(category => (
                            <option key={category} value={category.toLowerCase()}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                      </div>

                      {/* Budget Type Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <select
                          name="budgetType"
                          value={formData.budgetType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                          <option value="saving">Saving</option>
                        </select>
                      </div>

                      {/* Frequency Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Frequency
                        </label>
                        <select
                          name="frequency"
                          value={formData.frequency}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="one-time">One-time</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      {formData.frequency !== 'one-time' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="date"
                              label="Start Date"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              label="End Date"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {taskType === 'budget' ? 'Notes' : 'Description'}
                    </label>
                    <textarea
                      name={taskType === 'budget' ? 'notes' : 'description'}
                      value={taskType === 'budget' ? formData.notes : formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={taskType === 'budget' ? 'Enter additional notes' : 'Enter task description'}
                    />
                  </div>

                  {/* Due Date Field */}
                  <div>
                    <Input
                      type="datetime-local"
                      label="Due Date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      error={errors.dueDate}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Priority Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Assignees Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assignees
                    </label>
                    <UserList
                      workspaceId={workspace?._id}
                      selectedUsers={selectedMembers}
                      onUserSelect={handleUserSelect}
                      showEmail
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-2 pt-4">
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
                      isLoading={isSubmitting}
                      disabled={isSubmitting || !workspace?._id}
                    >
                      {isSubmitting ? 'Creating...' : taskType === 'budget' ? 'Add Budget Item' : 'Create Task'}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export { AddTask };
export default AddTask; 