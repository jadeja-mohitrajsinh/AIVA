import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCog, FaClock, FaBell, FaSun, FaMoon, FaDesktop, FaTrash } from 'react-icons/fa';
import { setTheme } from '../redux/slices/themeSlice';
import { useUpdateWorkspaceMutation } from '../redux/slices/api/workspaceApiSlice';
import { toast } from 'sonner';

const WorkspaceSettings = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.current);
  const workspace = useSelector((state) => state.workspace.current);
  const [activeTab, setActiveTab] = useState('general');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [workspaceData, setWorkspaceData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || ''
  });

  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();

  // Effect to initialize workspace data
  useEffect(() => {
    if (workspace) {
      setWorkspaceData({
        name: workspace.name,
        description: workspace.description || ''
      });
    }
  }, [workspace]);

  // Effect to initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        dispatch(setTheme('dark'));
      } else {
        dispatch(setTheme('light'));
      }
    }
  }, [dispatch]);

  // Effect to apply theme changes
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (currentTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (currentTheme === 'system') {
      // Remove any explicit theme classes and let system preference take over
      document.documentElement.classList.remove('dark', 'light');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleWorkspaceChange = (e) => {
    const { name, value } = e.target;
    setWorkspaceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await updateWorkspace({
        workspaceId: workspace.id,
        ...workspaceData
      }).unwrap();
      toast.success('Workspace settings updated successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update workspace settings');
    }
  };

  const handleMoveToTrash = () => {
    // Add trash functionality here
    toast.error('This action cannot be undone. Please contact support to delete your workspace.');
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Workspace notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Workspace Settings
          </h1>
          <p className="text-gray-600">
            Manage your workspace preferences and configuration
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Settings Navigation */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <nav className="flex space-x-8 p-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-4 px-1 ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaCog />
                <span>General</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`pb-4 px-1 ${
                activeTab === 'time'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaClock />
                <span>Time Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-4 px-1 ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaBell />
                <span>Notifications</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'general' && (
            <div className="p-6 space-y-8">
              {/* Workspace Details Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Workspace Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      id="workspaceName"
                      name="name"
                      value={workspaceData.name}
                      onChange={handleWorkspaceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter workspace name"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={workspaceData.description}
                      onChange={handleWorkspaceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter workspace description"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Settings Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Theme Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border ${
                      currentTheme === 'light'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FaSun className={`w-6 h-6 ${
                        currentTheme === 'light'
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        currentTheme === 'light'
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        Light Mode
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border ${
                      currentTheme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FaMoon className={`w-6 h-6 ${
                        currentTheme === 'dark'
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        currentTheme === 'dark'
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        Dark Mode
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-4 rounded-lg border ${
                      currentTheme === 'system'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FaDesktop className={`w-6 h-6 ${
                        currentTheme === 'system'
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        currentTheme === 'system'
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        System Default
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Danger Zone
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-red-800">
                        Delete Workspace
                      </h3>
                      <p className="text-sm text-red-600">
                        Once you delete a workspace, there is no going back. Please be certain.
                      </p>
                    </div>
                    <button
                      onClick={handleMoveToTrash}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2 transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span>Move to Trash</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      Workspace Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications about workspace updates and activities
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationsEnabled}
                      onChange={handleNotificationToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Time Zone Settings
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Time zone settings coming soon...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings; 