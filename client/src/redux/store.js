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
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import { apiSlice } from "./slices/apiSlice";
import workspaceReducer from './slices/workspaceSlice';
import taskApiSlice from './slices/api/taskApiSlice';
import notificationReducer from './slices/notificationSlice';
import notificationMiddleware from './middleware/notificationMiddleware';
import { noteApiSlice } from './slices/api/noteApiSlice';
import { workspaceApiSlice } from './slices/api/workspaceApiSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    workspace: workspaceReducer,
    [taskApiSlice.reducerPath]: taskApiSlice.reducer,
    [noteApiSlice.reducerPath]: noteApiSlice.reducer,
    [workspaceApiSlice.reducerPath]: workspaceApiSlice.reducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(taskApiSlice.middleware)
      .concat(noteApiSlice.middleware)
      .concat(workspaceApiSlice.middleware)
      .concat(notificationMiddleware),
  devTools: true,
});

export default store;
