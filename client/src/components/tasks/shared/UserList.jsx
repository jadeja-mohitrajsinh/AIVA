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
import React, { useMemo } from 'react';
import { UserInfo } from '../../shared/display/UserInfo';
import { Avatar } from '../../shared/display/Avatar';
import { useGetWorkspaceMembersQuery } from '../../../redux/slices/api/workspaceApiSlice';
import { LoadingSpinner } from '../../shared/feedback/LoadingSpinner';

const UserList = ({ 
  workspaceId,
  selectedUsers = [], 
  onUserSelect,
  maxDisplay = 10,
  showEmail = false,
  showRole = false,
  size = 'sm'
}) => {
  const { data: membersData, isLoading, error } = useGetWorkspaceMembersQuery(
    workspaceId,
    { 
      skip: !workspaceId,
      refetchOnMountOrArgChange: true
    }
  );

  // Process members data
  const members = useMemo(() => {
    if (!membersData?.members) return [];
    
    return membersData.members
      .filter(member => 
        member && 
        member.user && 
        member.user._id && 
        member.user.name &&
        member.isActive // Only show active members
      )
      .map(member => ({
        ...member,
        user: member.user,
        role: member.role || 'member'
      }))
      .slice(0, maxDisplay);
  }, [membersData, maxDisplay]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
        Unable to load team members
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
        No team members found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.user._id}
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
            selectedUsers.includes(member.user._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onClick={() => onUserSelect?.(member.user._id)}
        >
          <div className="flex items-center space-x-3">
            <Avatar
              src={member.user.avatar}
              name={member.user.name}
              size={size}
            />
            <UserInfo
              name={member.user.name}
              email={showEmail ? member.user.email : undefined}
              role={showRole ? member.role : undefined}
              size={size}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList; 