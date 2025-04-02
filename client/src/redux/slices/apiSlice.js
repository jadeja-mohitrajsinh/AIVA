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
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from 'sonner';
import { logout } from './authSlice';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL || '';

const baseQuery = fetchBaseQuery({ 
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  }
});

const baseQueryWithRetry = async (args, api, extraOptions) => {
  const queryArgs = {
    ...args,
    url: args?.url?.startsWith('/api/') ? args.url : `/api/${args?.url?.startsWith('/') ? args.url.substring(1) : args.url || ''}`
  };

  const token = api.getState()?.auth?.token;
  const isAuthRoute = queryArgs.url.includes('auth/');
  const isPublicRoute = queryArgs.url.includes('public');

  // Only require token for protected routes
  if (!token && !isAuthRoute && !isPublicRoute) {
    return {
      error: {
        status: 401,
        data: { message: 'Authentication required' }
      }
    };
  }

  const result = await baseQuery(queryArgs, api, extraOptions);

  // Handle 401 errors
  if (result.error?.status === 401) {
    api.dispatch(logout());
    return result;
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Task', 'Tasks', 'User', 'Workspace', 'Notification', 'Dashboard'],
  endpoints: (builder) => ({})
});
