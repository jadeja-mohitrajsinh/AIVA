/*=================================================================
* Project: AIVA-WEB
* File: notificationService.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Service for managing system notifications, including creation
* and delivery of notifications to users.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import Notification from '../models/notification.js'; // Adjust the path as necessary

export const createTaskAssignmentNotifications = async ({ task, previousAssignees, actorId }) => {
    // Logic to create notifications for task assignments
    const notifications = [];

    for (const assignee of task.assignees) {
        if (!previousAssignees.includes(assignee.toString())) {
            const notification = new Notification({
                user: assignee,
                message: `You have been assigned to the task: ${task.title}`,
                task: task._id,
                createdBy: actorId,
                createdAt: new Date()
            });
            notifications.push(notification);
        }
    }

    await Notification.insertMany(notifications);
    return notifications;
}; 