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
const API_URL = 'https://aiva-lfxq.onrender.com';

const baseQuery = fetchBaseQuery({ 
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  }
});

const baseQueryWithRetry = async (args, api, extraOptions) => {
  const queryArgs = {
    ...args,
    url: args?.url?.startsWith('/api/') ? args.url : `/api/${args?.url?.startsWith('/') ? args.url.substring(1) : args.url || ''}`
  };

  console.log('API Request:', {
    url: queryArgs.url,
    method: queryArgs.method,
    baseUrl: API_URL,
    fullUrl: `${API_URL}${queryArgs.url}`
  });

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

  try {
    const result = await baseQuery(queryArgs, api, extraOptions);
    
    // Log successful response
    if (!result.error) {
      console.log('API Response Success:', {
        url: queryArgs.url,
        status: 'success'
      });
    } else {
      // Log error response
      console.error('API Response Error:', {
        url: queryArgs.url,
        status: result.error.status,
        message: result.error.data?.message || 'Unknown error'
      });
    }

    // Handle 401 errors
    if (result.error?.status === 401) {
      api.dispatch(logout());
    }

    return result;
  } catch (error) {
    console.error('API Request Failed:', {
      url: queryArgs.url,
      error: error.message
    });
    return {
      error: {
        status: 'FETCH_ERROR',
        data: { message: 'Failed to process request' }
      }
    };
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Task', 'Tasks', 'User', 'Workspace', 'Notification', 'Dashboard'],
  endpoints: (builder) => ({})
});
