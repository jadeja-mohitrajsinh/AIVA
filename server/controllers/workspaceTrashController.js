/*=================================================================
* Project: AIVA-WEB
* File: workspaceTrashController.js
* Author: Mohitraj Jadeja
* Date Created: March 13, 2024
* Last Modified: March 13, 2024
*=================================================================
* Description:
* Controller for managing workspace trash operations.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import asyncHandler from 'express-async-handler';
import { Workspace } from '../models/workspace.js';

// @desc    Get all trashed workspaces
// @route   GET /api/workspaces/trash
// @access  Private
export const getTrashedWorkspaces = asyncHandler(async (req, res) => {
  try {
    const trashedWorkspaces = await Workspace.find({
      isDeleted: true,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ deletedAt: -1 });

    res.json({
      status: true,
      data: trashedWorkspaces
    });
  } catch (error) {
    console.error('Error fetching trashed workspaces:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching trashed workspaces'
    });
  }
});

// @desc    Move workspace to trash
// @route   PUT /api/workspaces/:id/trash
// @access  Private
export const moveWorkspaceToTrash = asyncHandler(async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({
        status: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    const member = workspace.members.find(m => 
      m.user && m.user._id.toString() === req.user._id.toString()
    );
    const isAdmin = member?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: false,
        message: 'Only workspace owners and admins can move workspaces to trash'
      });
    }

    // Check if workspace is already in trash
    if (workspace.isDeleted) {
      return res.status(400).json({
        status: false,
        message: 'Workspace is already in trash'
      });
    }

    // Ensure owner member exists and has correct role
    const ownerMember = workspace.members.find(m => 
      m.user && m.user._id.toString() === workspace.owner._id.toString()
    );
    
    if (!ownerMember) {
      // Add owner as member if not present
      workspace.members.push({
        user: workspace.owner,
        role: 'owner',
        permissions: {
          canEditWorkspace: true,
          canDeleteWorkspace: true,
          canInviteMembers: true,
          canRemoveMembers: true,
          canManageRoles: true,
          canMoveToTrash: true
        },
        isActive: true
      });
    } else {
      // Ensure owner member has correct role
      ownerMember.role = 'owner';
      ownerMember.permissions = {
        canEditWorkspace: true,
        canDeleteWorkspace: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canManageRoles: true,
        canMoveToTrash: true
      };
    }

    // Sanitize all member roles
    workspace.members.forEach(member => {
      if (member.role) {
        member.role = member.role.trim().toLowerCase();
        if (!['owner', 'admin', 'member'].includes(member.role)) {
          member.role = 'member';
        }
      } else {
        member.role = 'member';
      }
    });

    workspace.isDeleted = true;
    workspace.deletedAt = new Date();
    workspace.deletedBy = req.user._id;
    
    await workspace.save();

    res.json({
      status: true,
      message: 'Workspace moved to trash successfully',
      data: workspace
    });
  } catch (error) {
    console.error('Error moving workspace to trash:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to move workspace to trash'
    });
  }
});

// @desc    Restore workspace from trash
// @route   PUT /api/workspaces/:id/restore
// @access  Private
export const restoreWorkspaceFromTrash = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      status: false,
      message: 'Workspace not found'
    });
  }

  // Check if user is owner or admin
  const isOwner = workspace.owner.toString() === req.user._id.toString();
  const isAdmin = workspace.members.some(
    m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      status: false,
      message: 'Not authorized to restore this workspace'
    });
  }

  workspace.isDeleted = false;
  workspace.deletedAt = null;
  workspace.deletedBy = null;
  await workspace.save();

  res.json({
    status: true,
    message: 'Workspace restored successfully',
    data: workspace
  });
});

// @desc    Permanently delete workspace
// @route   DELETE /api/workspaces/:id/delete-permanent
// @access  Private
export const permanentlyDeleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    return res.status(404).json({
      status: false,
      message: 'Workspace not found'
    });
  }

  // Only owner can permanently delete
  if (workspace.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: false,
      message: 'Only the workspace owner can permanently delete the workspace'
    });
  }

  await workspace.deleteOne();

  res.json({
    status: true,
    message: 'Workspace permanently deleted'
  });
}); 