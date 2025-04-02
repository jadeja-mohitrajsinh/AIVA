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
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';
import { setCurrentWorkspace } from '../redux/slices/workspaceSlice';
import { LoadingSpinner } from '../components/shared/feedback/LoadingSpinner';
import { FaTasks, FaStickyNote, FaCalendar, FaUsers, FaChartLine } from 'react-icons/fa';
import { useGetPublicWorkspacesQuery } from '../redux/slices/api/workspaceApiSlice';

const WorkspaceFeatureCard = ({ title, description, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center mb-4">
      <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-sm">
      {description}
    </p>
  </div>
);

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspace, isLoading } = useWorkspace();
  const { data: publicWorkspaces = [], isLoading: isLoadingPublic } = useGetPublicWorkspacesQuery();

  useEffect(() => {
    if (workspaceId && (!workspace || workspace._id !== workspaceId)) {
      const targetWorkspace = publicWorkspaces.find(w => w._id === workspaceId);
      if (targetWorkspace) {
        dispatch(setCurrentWorkspace(targetWorkspace));
      }
    }
  }, [workspaceId, workspace, publicWorkspaces, dispatch]);

  if (isLoading || isLoadingPublic) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Workspace not found
          </h2>
          <button
            onClick={() => navigate('/workspace')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Workspace List
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: 'Dashboard',
      description: 'View workspace overview and statistics',
      icon: FaChartLine,
      path: `/workspace/${workspace._id}`
    },
    {
      title: 'Tasks',
      description: 'Manage and organize workspace tasks',
      icon: FaTasks,
      path: `/workspace/${workspace._id}/tasks`
    },
    {
      title: 'Notes',
      description: 'Create and manage workspace notes',
      icon: FaStickyNote,
      path: `/workspace/${workspace._id}/notes`
    },
    {
      title: 'Calendar',
      description: 'Schedule and track workspace events',
      icon: FaCalendar,
      path: `/workspace/${workspace._id}/calendar`
    },
    {
      title: 'Team',
      description: 'Manage workspace members and roles',
      icon: FaUsers,
      path: `/workspace/${workspace._id}/team`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Workspace Header */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {workspace.name}
        </h1>
        {workspace.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {workspace.description}
          </p>
        )}
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <FaUsers className="w-4 h-4 mr-2" />
          <span>{workspace.members?.length || 0} member{workspace.members?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <WorkspaceFeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onClick={() => navigate(feature.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default Workspace; 