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
import { apiSlice } from "../apiSlice";

const AUTH_URL = "/api/auth";
const WORKSPACE_URL = "/api/workspaces";
const NOTIFICATIONS_URL = "/api/notifications";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getUsers: builder.query({
      query: () => ({
        url: `${WORKSPACE_URL}/users/all`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) return [];
        return response.data || [];
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || 'Failed to fetch users'
      }),
      providesTags: ['User'],
    }),

    // User Profile Management
    getUserProfile: builder.query({
      query: () => ({
        url: `${AUTH_URL}/profile`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) return null;
        return response.data;
      },
    }),
    updateProfile: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        return {
          url: `${AUTH_URL}/profile`,
          method: 'PUT',
          body: data,
          // Don't set Content-Type for FormData, browser will set it automatically with boundary
          headers: isFormData ? {} : {
            'Content-Type': 'application/json'
          }
        };
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || 'Failed to update profile');
        }
        return response.data;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || 'Failed to update profile'
      }),
      invalidatesTags: ['User', 'Profile'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update auth state with new user data
          dispatch({
            type: 'auth/updateUser',
            payload: data
          });
        } catch (error) {

          //console.error('Error updating profile:', error);

        }
      }
    }),
    requestOtp: builder.mutation({
      query: () => ({
        url: `${AUTH_URL}/request-otp`,
        method: "POST",
        credentials: "include",
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/change-password`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    // Notification Management
    getNotifications: builder.query({
      query: () => ({
        url: NOTIFICATIONS_URL,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) return [];
        return response.data || [];
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || 'Failed to fetch notifications'
      }),
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: "PUT",
      }),
      transformResponse: (response) => ({
        status: true,
        data: response.data
      }),
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || 'Failed to mark notification as read'
      }),
      invalidatesTags: ['Notification'],
    }),

    // Workspace Member Management
    getWorkspaceMembers: builder.query({
      query: (workspaceId) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response?.status) return { members: [] };
        return {
          members: response.data || [],
          status: true
        };
      },
    }),
    addWorkspaceMember: builder.mutation({
      query: ({ workspaceId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Workspace'],
    }),
    updateWorkspaceMemberRole: builder.mutation({
      query: ({ workspaceId, userId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Workspace'],
    }),
    removeWorkspaceMember: builder.mutation({
      query: ({ workspaceId, userId }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Workspace'],
    }),
    sendWorkspaceInvite: builder.mutation({
      query: ({ workspaceId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/invite/email`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    sendBulkWorkspaceInvites: builder.mutation({
      query: ({ workspaceId, data }) => ({
        url: `${WORKSPACE_URL}/${workspaceId}/invite/bulk`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  // User List Hook
  useGetUsersQuery,
  // User Profile Hooks
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useRequestOtpMutation,
  useChangePasswordMutation,

  // Notification Hooks
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,

  // Workspace Member Management Hooks
  useGetWorkspaceMembersQuery,
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
  useSendWorkspaceInviteMutation,
  useSendBulkWorkspaceInvitesMutation,
} = userApiSlice;
