/*=================================================================
* Project: AIVA-WEB
* File: taskMiddleware.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Task-specific middleware for handling task access control and
* validation of task operations.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import Task from '../models/task.js';
import { Workspace } from '../models/index.js';
import mongoose from 'mongoose';

// Get task by ID and check user has access
export const getTaskById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Skip task lookup for bulk operations
  if (id === 'all') {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      res.status(400);
      throw new Error('Workspace ID is required for bulk operations');
    }

    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
      }

      // Check if user is workspace member
      const isMember = workspace.members.some(
        m => m.user.toString() === req.user._id.toString() && m.isActive
      );
      if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to access this workspace');
      }

      req.workspace = workspace;
      next();
      return;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        res.status(400);
        throw new Error('Invalid workspace ID format');
      }
      throw error;
    }
  }

  // For single task operations
  try {
    const task = await Task.findById(id)
      .populate('creator', 'name email')
      .populate('assignees', 'name email')
      .populate('workspace', 'name')
      .populate({
        path: 'activities.by',
        select: 'name email'
      });
    
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Get workspace to check permissions
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      res.status(404);
      throw new Error('Associated workspace not found');
    }

    // Check if user is workspace member
    const isMember = workspace.members.some(
      m => m.user.toString() === req.user._id.toString() && m.isActive
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to access this task');
    }

    if (workspace.type === 'private') {
      // Check if user is a member of the private workspace
    } else {
      // Public workspace logic
    }

    req.task = task;
    req.workspace = workspace;
    next();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }
    throw error;
  }
});

// Check if user can modify task
export const canModifyTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { workspaceId } = req.query;

  // For bulk operations, check workspace membership
  if (id === 'all') {
    if (!workspaceId) {
      res.status(400);
      throw new Error('Workspace ID is required for bulk operations');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.isActive
    );

    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to modify tasks in this workspace');
    }

    return next();
  }

  // For single task operations
  const task = req.task;
  const workspace = await Workspace.findById(task.workspace);
  
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(member => 
    member.user.toString() === req.user._id.toString() && member.isActive
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to modify this task');
  }

  if (workspace.type === 'private') {
    // Check if user is a member of the private workspace
  } else {
    // Public workspace logic
  }

  next();
}); 