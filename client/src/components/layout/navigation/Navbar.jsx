/*=================================================================
* Project: AIVA-WEB
* File: Navbar.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Navbar component for displaying the navigation bar.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../../workspace/provider/WorkspaceProvider';
import { ThemeToggle } from '../../shared/theme/ThemeToggle';
import { UserAvatar } from '../../shared/display/UserAvatar';
import ProfileDialog from '../../shared/dialog/ProfileDialog';
import NotificationCenter from '../../shared/notifications/NotificationCenter';

export const Navbar = ({ setSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  // Only use workspace context if we're not on auth pages
  const isAuthPage = location.pathname.includes('/log-in') || location.pathname.includes('/register');
  let workspaceData = {};
  
  if (!isAuthPage) {
    try {
      const { workspace } = useWorkspace();
      workspaceData = { workspace };
    } catch (error) {
      // Silently handle the error when workspace context is not available
      workspaceData = { workspace: null };
    }
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          {!isAuthPage && (
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300"
              onClick={() => setSidebarOpen?.(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <FaBars className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Workspace Title (visible on mobile) */}
          {!isAuthPage && workspaceData.workspace && (
            <div className="flex items-center lg:hidden">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {workspaceData.workspace?.name || 'Select Workspace'}
              </h1>
            </div>
          )}

          <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
            {/* Theme Toggle */}
            <NotificationCenter />
            <ThemeToggle />

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center focus:outline-none"
                >
                  <UserAvatar
                    src={user?.avatar}
                    alt={user?.name}
                    size="sm"
                    className="cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog
        open={isProfileOpen}
        setOpen={setIsProfileOpen}
      />
    </>
  );
}; 