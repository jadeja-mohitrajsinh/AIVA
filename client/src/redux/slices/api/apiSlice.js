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
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = async (args, api, extraOptions) => {
    const token = api.getState().auth.token; // Adjust this based on your state structure
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers) => {
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    })(args, api, extraOptions);
};

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Workspace'],
    endpoints: (builder) => ({
        // Define your endpoints here
    }),
});