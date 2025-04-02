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
import React, { useState } from 'react';
import { format } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { usePostActivityMutation } from '../../redux/slices/api/taskApiSlice';
import { toast } from 'sonner';
import { Button } from '../shared';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const TaskChat = ({ task }) => {
  const [comment, setComment] = useState('');
  const [postActivity] = usePostActivityMutation();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!task?._id) {
      toast.error('No task ID provided.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Comment is required');
      return;
    }
    try {
      const activityData = {
        type: 'comment', // Assuming the type is 'comment'
        content: comment,
      };
      const result = await postActivity({ id: task._id, data: activityData }).unwrap();

      //.log(result);
      setComment('');
      toast.success('Activity posted successfully');
    } catch (err) {
      //console.error('Error posting activity:', err);
      toast.error(err?.data?.message || 'Failed to post activity');
    }
  };

  return (
    <div>
      <div className="space-y-4 mb-4">
        {task.activities?.map((activity, index) => (
          <div key={index} className="flex space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {activity.content}
              </p>
              <span className="text-xs text-gray-500">
                {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          icon={PaperAirplaneIcon}
          onClick={handleSubmit}
          disabled={!comment.trim()}
          label="Send"
        />
      </form>
    </div>
  );
};

export default TaskChat;
