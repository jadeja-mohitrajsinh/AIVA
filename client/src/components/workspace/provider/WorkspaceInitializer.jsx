import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetPrivateWorkspaceQuery } from '../../../redux/slices/api/workspaceApiSlice';
import { setPrivateWorkspace } from '../../../redux/slices/authSlice';
import { setCurrentWorkspace } from '../../../redux/slices/workspaceSlice';
import { LoadingSpinner } from '../../shared/feedback/LoadingSpinner';

const WorkspaceInitializer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentWorkspace } = useSelector(state => state.workspace);

  const {
    data,
    error,
    isLoading
  } = useGetPrivateWorkspaceQuery(undefined, {
    skip: !user?._id
  });

  useEffect(() => {
    if (data?.status && data?.data) {
      dispatch(setPrivateWorkspace(data.data));
      
      if (!currentWorkspace) {
        dispatch(setCurrentWorkspace(data.data));
      }
    }
  }, [data, dispatch, currentWorkspace]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return null;
};

export default WorkspaceInitializer; 