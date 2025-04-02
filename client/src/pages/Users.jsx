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
import React, { useState, useEffect, useMemo } from "react";
import Title from "../components/shared/display/Title";
import Button from "../components/shared/buttons/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmationDialog, { UserAction } from "../components/shared/dialog/Dialogs";
import AddUser from "../components/workspace/management/AddUser";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetWorkspaceMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
  useRemoveMemberMutation,
  useGetWorkspaceQuery,
  useInviteMemberMutation
} from '../redux/slices/api/workspaceApiSlice';
import { LoadingSpinner } from '../components/shared/feedback/LoadingSpinner';
import { ErrorAlert } from '../components/shared/feedback/ErrorAlert';
import { FaUserCircle, FaClock, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../components/shared/dialog/Modal';
import { useWorkspace } from '../components/workspace/provider/WorkspaceProvider';

const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

const formatJoinedDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Private workspace message component
const PrivateWorkspaceMessage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Private Workspace
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Team management features are only available in shared workspaces.
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        To manage team members, please create or switch to a shared workspace.
      </p>
    </div>
  </div>
);

const Users = () => {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspace();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [validMembers, setValidMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updateMemberStatus] = useUpdateMemberStatusMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sendInvite] = useInviteMemberMutation();

  // Validate workspace ID
  const isValidWorkspaceId = workspaceId && /^[0-9a-fA-F]{24}$/.test(workspaceId);

  // Check if workspace is private
  const isPrivateWorkspace = workspace?.type === 'private' || workspace?.type === 'PrivateWorkspace';

  // Get workspace members with validation
  const {
    data: members,
    isLoading: isMembersLoading,
    error: membersError,
    refetch
  } = useGetWorkspaceMembersQuery(workspaceId, {
    skip: !isValidWorkspaceId || isPrivateWorkspace || !workspace,
    refetchOnMountOrArgChange: true
  });

  // Handle invalid workspace ID
  useEffect(() => {
    if (workspaceId && !isValidWorkspaceId) {

      toast.error('Invalid workspace ID format');
      navigate('/dashboard');
      return;
    }
  }, [workspaceId, isValidWorkspaceId, navigate]);

  // Handle private workspace access attempt
  useEffect(() => {
    if (workspace && isPrivateWorkspace) {


      toast.error('Team management is not available for private workspaces');
      navigate(`/tasks/${workspaceId}/dashboard`);
      return;
    }
  }, [workspace, isPrivateWorkspace, workspaceId, navigate]);

  // Loading states
  if (!workspace || isMembersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state with detailed error handling
  if (membersError) {


    let errorMessage = 'Failed to load workspace members';
    
    if (membersError.status === 404) {
      errorMessage = 'Workspace not found or you do not have access';
    } else if (membersError.status === 403) {
      errorMessage = 'You do not have permission to view team members';
    } else if (membersError.data?.message) {
      errorMessage = membersError.data.message;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">Error Loading Members</h2>
          <p>{errorMessage}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => refetch()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/tasks/${workspaceId}/dashboard`)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract members array and workspace data
  const workspaceData = useMemo(() => {
    if (!workspace) return null;
    return workspace.workspace || workspace;
  }, [workspace]);

  // Memoize permission checks to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    if (!workspaceData || !user?._id) return {
      isWorkspaceOwner: false,
      currentUserMember: null,
      isAdmin: false,
      canManageMembers: false
    };

    const isWorkspaceOwner = user?._id === workspaceData.owner;
    const currentUserMember = members?.find(m => m.user._id === user?._id);
    const isAdmin = currentUserMember?.role === 'admin' || isWorkspaceOwner;
    const canManageMembers = isWorkspaceOwner || isAdmin;

    return {
      isWorkspaceOwner,
      currentUserMember,
      isAdmin,
      canManageMembers
    };
  }, [user?._id, workspaceData?.owner, members]);

  const { isWorkspaceOwner, currentUserMember, isAdmin, canManageMembers } = permissions;

  // Updated helper functions
  const getMemberStatus = (member) => {
    if (!member) return 'inactive';
    if (member.status === 'archived') return 'archived';
    return member.isActive ? 'active' : 'inactive';
  };

  // Memoize valid members with complete data
  const processedMembers = useMemo(() => {
    if (!members?.length || !workspaceData?.owner) return [];

    return members
      .filter(member => member && member.user && member.user._id)
      .map(member => {
        const isOwner = member.user._id === workspaceData.owner;
        
        return {
          ...member,
          role: isOwner ? 'owner' : (member.role || 'member'),
          isActive: isOwner ? true : (member.isActive ?? true),
          status: member.status || (member.isActive ? 'active' : 'inactive')
        };
      });
  }, [members, workspaceData?.owner]);

  // Add all useEffect hooks here
  useEffect(() => {
    if (processedMembers?.length > 0) {
      setValidMembers(processedMembers);
    }
  }, [processedMembers]);

  useEffect(() => {
    if (members?.length > 0) {


    }
  }, [members, processedMembers, validMembers, workspaceData]);

  useEffect(() => {
    const debugInfo = {
      currentUser: user?._id,
      workspaceOwnerId: workspaceData?.owner,
      currentUserRole: currentUserMember?.role,
      isWorkspaceOwner,
      isAdmin,
      canManageMembers,
      memberCount: members?.length || 0
    };


  }, [
    user?._id,
    workspaceData?.owner,
    currentUserMember?.role,
    isWorkspaceOwner,
    isAdmin,
    canManageMembers,
    members?.length
  ]);

  useEffect(() => {
    let timeoutId;
    if (membersError) {
      timeoutId = setTimeout(() => {


        refetch();
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [membersError, refetch]);

  useEffect(() => {
    if (membersError) {


      toast.error(membersError?.data?.message || 'Failed to load team members');
    }
  }, [membersError]);

  // Updated action handlers
  const handleUserAction = async (member) => {
    try {
      // Early validation for member data
      if (!member?.user?._id) {


        toast.error("Invalid member data");
        setOpenAction(false);
        return;
      }

      // Early validation for workspace owner
      const isOwner = member.user._id === workspaceData?.owner;
      if (isOwner) {


        toast.error("Cannot modify workspace owner's status");
        setOpenAction(false);
        return;
      }

      // Permission check with logging
      if (!canManageMembers) {


        toast.error("You don't have permission to perform this action");
        setOpenAction(false);
        return;
      }

      // Admin status check with logging
      const isTargetAdmin = member.role === 'admin';
      if (isTargetAdmin && !isWorkspaceOwner) {

        toast.error("Only workspace owner can modify admin status");
        setOpenAction(false);
        return;
      }

      const currentStatus = getMemberStatus(member);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';



      const result = await updateMemberStatus({
        workspaceId: workspaceId,
        userId: member.user._id,
        status: newStatus
      }).unwrap();

      if (result.status) {
        toast.success(`Member ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        await refetch();
        setSelected(null);
        setOpenAction(false);
      }
    } catch (error) {

      // Structured error handling
      if (error?.isOwnerError) {
        toast.error("Cannot modify workspace owner's status");
      } else if (error?.isAdminError) {
        toast.error("Only workspace owner can modify admin status");
      } else if (error?.isSelfModificationError) {
        toast.error("Cannot modify your own status");
      } else if (error?.isPermissionError) {
        toast.error("You don't have permission to perform this action");
      } else if (error?.status === 403) {
        toast.error(error?.data?.message || "You don't have permission to perform this action");
      } else if (error?.status === 404) {
        toast.error(error?.data?.message || "Member not found");
      } else {
        toast.error(error?.data?.message || "Failed to update member status");
      }
      
      setOpenAction(false);
    }
  };

  const handleDelete = async (member) => {
    try {
      if (!member?.user?._id) {
        toast.error('Invalid member data');
        return;
      }

      // Show confirmation dialog
      if (!window.confirm(`Are you sure you want to remove ${member.user.name} from the workspace?`)) {
        return;
      }

      setIsLoading(true);

      const response = await removeMember({
        workspaceId: workspaceId,
        userId: member.user._id
      }).unwrap();

      if (response.status) {
        toast.success(response.message || 'Member removed successfully');
        // Refresh member list
        await refetch();
      } else {
        toast.error(response.message || 'Failed to remove member');
      }
    } catch (error) {

      toast.error(
        error.data?.message || 
        error.message || 
        'Failed to remove member. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await sendInvite({
        workspaceId: workspaceId,
        email: inviteEmail
      }).unwrap();

      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setShowInviteDialog(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send invitation');
    }
  };

  // Move renderDeleteConfirmation before the return statement
  const renderDeleteConfirmation = () => (
    <ConfirmationDialog
      open={openDialog}
      setOpen={setOpenDialog}
      title="Remove Team Member"
      message={
        selected ? (
          <div className="space-y-4">
            <p>Are you sure you want to remove <span className="font-semibold">{selected.user?.name}</span> from the workspace?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone. The member will lose access to all workspace resources.</p>
          </div>
        ) : "Are you sure you want to remove this member?"
      }
      confirmLabel="Remove Member"
      confirmColor="red"
      onClick={() => handleDelete(selected)}
    />
  );

  // Move all other render functions here too
  const renderMemberRole = (member) => {
    const roleStyles = {
      owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    };

    const role = member.role || 'member';

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const renderMemberStatus = (member) => {
    const status = getMemberStatus(member);
    const isOwner = member.user._id === workspace?.owner;

    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        label: "Active"
      },
      inactive: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        label: "Inactive"
      },
      archived: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        label: "Archived"
      }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {isOwner ? "Owner" : config.label}
      </span>
    );
  };

  const renderActionButtons = (member) => {
    if (!member?.user?._id) return null;

    // Check if member is owner
    const isOwner = member.user._id === workspaceData?.owner;
    if (isOwner) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          <FaUserCircle className="mr-2" />
          Workspace Owner
        </span>
      );
    }

    // Check permissions
    if (!canManageMembers) return null;

    const status = getMemberStatus(member);
    const isActive = status === 'active';
    const isAdmin = member.role === 'admin';

    // Don't show status change button for admins if not owner
    if (isAdmin && !isWorkspaceOwner) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <FaUserCircle className="mr-2" />
          Admin
        </span>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setSelected(member);
            setOpenAction(true);
          }}
          className={clsx(
            "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium",
            isActive
              ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
              : "text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
          )}
        >
          {isActive ? (
            <>
              <FaClock className="mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <FaUserCircle className="mr-2" />
              Activate
            </>
          )}
        </button>
        {isWorkspaceOwner && status !== 'archived' && (
          <button
            onClick={() => {
              setSelected(member);
              setOpenDialog(true);
            }}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
          >
            <FaTrash className="mr-2" />
            Remove
          </button>
        )}
      </div>
    );
  };

  if (!workspaceId) {
    return (
      <ErrorAlert message="No workspace selected. Please select a workspace first." />
    );
  }

  // Stats Section - Update the active members count calculation
  const getActiveMembersCount = () => {
    if (!validMembers?.length) return 0;
    return validMembers.filter(member => member.isActive).length;
  };

  // Update Stats Section
  const renderStats = () => {
    if (!members) return null;

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.isActive).length;
    const admins = members.filter(m => m.role === 'admin').length;

      return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {totalMembers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Members</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">
            {activeMembers}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {admins}
          </p>
        </div>
        </div>
      );
  };

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your team members and their access levels
            </p>
          </div>
          {isWorkspaceOwner && (
            <Button
              label="Add Team Member"
              icon={<IoMdAdd className="text-lg" />}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Stats Section */}
      {renderStats()}

      {/* Team Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined Date
                  </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {members?.map((member) => (
                <tr key={member.user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-medium">
                        {getInitials(member.user.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.user.email || 'No email'}
                        </div>
                      </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    {renderMemberRole(member)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderMemberStatus(member)}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatJoinedDate(member.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {renderActionButtons(member)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Modals Section */}
      <AddUser
        open={open}
        setOpen={setOpen}
        workspaceId={workspaceId}
        onSuccess={() => {
          refetch();
          setOpen(false);
        }}
      />

      {renderDeleteConfirmation()}
      
      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={() => handleUserAction(selected)}
        member={selected}
      />

      {/* Invite Member Dialog */}
      <Modal
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        title="Invite Team Member"
      >
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowInviteDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteMember}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;