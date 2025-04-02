/*=================================================================
* Project: AIVA-WEB
* File: Sidebar.jsx
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Sidebar component for displaying the sidebar.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaChevronDown, FaChevronUp, FaHome, FaUsers, FaPlus, FaTasks, FaCalendar, FaChartLine, FaStickyNote, FaChartBar, FaCalendarAlt, FaTrash, FaEdit, FaCog } from 'react-icons/fa';
import { useWorkspace } from '../../workspace/provider/WorkspaceProvider';
import { setCurrentWorkspace } from '../../../redux/slices/workspaceSlice';
import { useGetPrivateWorkspacesQuery, useGetPublicWorkspacesQuery, useMoveWorkspaceToTrashMutation } from '../../../redux/slices/api/workspaceApiSlice';
import CreateWorkspace from '../../workspace/management/CreateWorkspace';
import WorkspaceSettings from '../../workspace/management/WorkspaceSettings';
import { toast } from 'sonner';
import { NavLink } from 'react-router-dom';

const WorkspaceSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between px-4 py-2 rounded-lg backdrop-blur-sm">
        <h3 className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
          {title}
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-transform duration-200 ease-in-out transform hover:scale-110"
        >
          {isOpen ? (
            <FaChevronUp className="w-3.5 h-3.5" />
          ) : (
            <FaChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="space-y-1 transition-all duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

const WorkspaceButton = ({ workspace, icon: Icon, isActive, onClick }) => {
  const navigate = useNavigate();
  const [moveWorkspaceToTrash] = useMoveWorkspaceToTrashMutation();
  const isAdmin = workspace.userRole === 'admin';

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/workspace/${workspace._id}/settings`);
  };

  const handleMoveToTrash = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to move "${workspace.name}" to trash?`)) {
      try {
        await moveWorkspaceToTrash(workspace._id).unwrap();
        toast.success(`Workspace "${workspace.name}" moved to trash`);
      } catch (error) {

        //console.error('Error moving workspace to trash:', error);
        toast.error(error?.data?.message || 'Failed to move workspace to trash');
      }
    }
  };

  return (
    <div
      className={`group flex items-center px-4 py-2 text-sm cursor-pointer relative 
      ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
      onClick={() => onClick(workspace)}
    >
      <div className="flex items-center min-w-0 space-x-2 flex-grow">
        <Icon className="w-4 h-4" />
        <span className="truncate">{workspace.name}</span>
      </div>

      {isAdmin && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors rounded hover:bg-blue-400/10"
            title="Edit workspace"
          >
            <FaEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMoveToTrash}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-400/10"
            title="Move to trash"
          >
            <FaTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};


const WorkspaceNavLinks = ({ workspace }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: `/workspace/${workspace._id}/dashboard`, icon: FaHome },
    { name: 'Tasks', path: `/workspace/${workspace._id}/tasks`, icon: FaTasks },
    { name: 'Notes', path: `/workspace/${workspace._id}/notes`, icon: FaStickyNote },
    { name: 'Calendar', path: `/workspace/${workspace._id}/calendar`, icon: FaCalendar },
    ...(workspace.type === 'PublicWorkspace' || workspace.visibility === 'public' 
      ? [{ name: 'Team', path: `/workspace/${workspace._id}/team`, icon: FaUsers }] 
      : []
    ),
    { name: 'Settings', path: `/workspace/${workspace._id}/settings`, icon: FaCog },
    { name: 'Trash', path: `/workspace/${workspace._id}/trash`, icon: FaTrash }
  ];

  return (
    <div className="mt-1 ml-7 space-y-1 border-l border-gray-200/50 dark:border-gray-700/50 transition-all duration-200">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path || 
                        (link.path.includes('dashboard') && location.pathname === `/workspace/${workspace._id}`);
        
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`
              w-full flex items-center px-4 py-2 text-[13px] rounded-lg transition-all duration-200
              backdrop-blur-sm hover:shadow-sm transform hover:-translate-y-0.5
              ${isActive
                ? 'bg-blue-50/80 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0 mr-2.5 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">{link.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspace } = useWorkspace();
  const { user } = useSelector(state => state.auth);
  const { data: privateWorkspaces = [] } = useGetPrivateWorkspacesQuery();
  const { data: publicWorkspaces = [] } = useGetPublicWorkspacesQuery();
  
  const [openSections, setOpenSections] = useState({
    private: true,
    public: true
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter public workspaces to only show ones the user has access to
  const accessiblePublicWorkspaces = React.useMemo(() => {
    return publicWorkspaces.filter(workspace => {
      // Check if user is a member
      const isMember = workspace.members?.some(member => {
        const memberId = member.user._id || member.user;
        return memberId === user?._id;
      });
      
      // Check if user is the owner
      const isOwner = workspace.owner === user?._id;
      
      // Include workspace if user is either a member or owner
      return isMember || isOwner;
    });
  }, [publicWorkspaces, user]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleWorkspaceSelect = async (selectedWorkspace) => {
    if (!selectedWorkspace?._id) return;
    
    try {
      dispatch(setCurrentWorkspace(selectedWorkspace));
      navigate(`/workspace/${selectedWorkspace._id}/dashboard`);
    } catch (error) {

      //console.error('Error selecting workspace:', error);
      toast.error('Failed to access workspace');
    }
  };

  const handleWorkspaceCreated = (workspace) => {
    handleWorkspaceSelect(workspace);
    setIsCreateModalOpen(false);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 z-[100] shadow-lg">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Logo */}
        <div className="sticky top-0 z-10 flex items-center justify-between py-5 px-6 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
            <img
              src="/7.png"
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center space-x-2">
            <Link
              to="/workspaces/trash"
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
                transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70"
              title="Workspace trash"
            >
              <FaTrash className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
                transition-all duration-200 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70 
                backdrop-blur-sm transform hover:scale-105 hover:shadow-md"
              title="Create new workspace"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Sections */}
        <div className="p-4 space-y-6">
          {/* Private Workspaces */}
          <WorkspaceSection
            title="Private Workspaces"
            isOpen={openSections.private}
            onToggle={() => toggleSection('private')}
          >
            <div className="space-y-1">
              {privateWorkspaces.map(privateWorkspace => (
                <div key={privateWorkspace._id}>
                  <WorkspaceButton
                    workspace={privateWorkspace}
                    icon={FaHome}
                    isActive={workspace?._id === privateWorkspace._id}
                    onClick={handleWorkspaceSelect}
                  />
                  {workspace?._id === privateWorkspace._id && (
                    <WorkspaceNavLinks workspace={privateWorkspace} />
                  )}
                </div>
              ))}
              {privateWorkspaces.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                  No private workspaces
                </p>
              )}
            </div>
          </WorkspaceSection>

          {/* Public Workspaces */}
          <WorkspaceSection
            title="Public Workspaces"
            isOpen={openSections.public}
            onToggle={() => toggleSection('public')}
          >
            <div className="space-y-1">
              {accessiblePublicWorkspaces.map(pubWorkspace => (
                <div key={pubWorkspace._id}>
                  <WorkspaceButton
                    workspace={pubWorkspace}
                    icon={FaUsers}
                    isActive={workspace?._id === pubWorkspace._id}
                    onClick={handleWorkspaceSelect}
                  />
                  {workspace?._id === pubWorkspace._id && (
                    <WorkspaceNavLinks workspace={pubWorkspace} />
                  )}
                </div>
              ))}
              {accessiblePublicWorkspaces.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                  No public workspaces
                </p>
              )}
            </div>
          </WorkspaceSection>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="sticky bottom-0 px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <div className="flex items-center p-2 rounded-xl bg-white/50 dark:bg-gray-700/30 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border-2 border-gray-200/50 dark:border-gray-600/50 transition-transform duration-200 hover:scale-105">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
                }}
              />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || 'Anonymous User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email || 'No email provided'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspace
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWorkspaceCreated}
      />
    </aside>
  );
};