import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './utils/suppressWarnings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Note from './pages/Note';
import TasksPage from './pages/TaskPage';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import TeamPage from './pages/TeamPage';
import { Sidebar } from './components/layout/navigation/Sidebar';
import { MobileSidebar } from './components/layout/navigation/MobileSidebar';
import { Navbar } from './components/layout/navigation/Navbar';
import { AuthLayout } from './components/layout/AuthLayout';
import ToastConfig from './components/shared/notifications/ToastConfig';
import WorkspaceProvider from './components/workspace/provider/WorkspaceProvider';
import WorkspaceInitializer from './components/workspace/provider/WorkspaceInitializer';
import { useLastPosition } from './hooks/useLastPosition';
import useWorkspaceRestoration from './hooks/useWorkspaceRestoration';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import WorkspaceCalendar from './pages/WorkspaceCalendar';
import WorkspaceInvitation from './pages/WorkspaceInvitation';
import InvitationsPage from './pages/InvitationsPage';
import Trash from './pages/Trash';
import Workspace from './pages/Workspace';
import TeamRouteGuard from './components/workspace/guards/TeamRouteGuard';
import WorkspaceTrash from './components/workspace/management/WorkspaceTrash';
import WorkspaceSettings from './components/workspace/management/WorkspaceSettings';
import WorkspaceSettingsPage from './components/workspace/pages/WorkspaceSettingsPage';

function RequireAuth({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/log-in') {
      sessionStorage.setItem('redirectPath', location.pathname + location.search);
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated || !user) {
    if (invitationId) {
      return <Navigate to={`/workspace/invitation?invitation=${invitationId}`} state={{ from: location }} replace />;
    }
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  return children;
}

function Layout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  useLastPosition();
  useWorkspaceRestoration();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  return (
    <WorkspaceProvider>
      <div className='flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900'>
        <div className='hidden md:flex md:flex-shrink-0'>
          <div className='w-64 bg-white dark:bg-gray-800'>
            <Sidebar />
          </div>
        </div>

        <MobileSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} />

        <div className='flex flex-col flex-1 w-0 overflow-hidden'>
          <Navbar setSidebarOpen={setIsMobileSidebarOpen} />
          
          <main className='relative overflow-y-auto focus:outline-none'>
            <div className='ml-7 max-w-7xl'>
              <Routes>
                <Route index element={<Navigate to='/dashboard' replace />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/invitations' element={<InvitationsPage />} />
                
                <Route path='/tasks'>
                  <Route path=':workspaceId/task/:taskId' element={<TaskDetails />} />
                  <Route path='new' element={<Navigate to='/workspace' replace />} />
                  <Route 
                    path=':workspaceId/dashboard' 
                    element={
                      <Navigate 
                        to={({params}) => `/workspace/${params.workspaceId}/dashboard`} 
                        replace 
                      />
                    }
                  />
                  <Route 
                    path=':workspaceId/*' 
                    element={
                      <Navigate 
                        to={location => `/workspace${location.pathname.replace('/tasks', '')}`} 
                        replace 
                      />
                    } 
                  />
                  <Route index element={<Navigate to='/workspace' replace />} />
                </Route>
                
                <Route path='/workspace'>
                  <Route index element={<WorkspaceDashboard />} />
                  <Route path=':workspaceId'>
                    <Route index element={<WorkspaceDashboard />} />
                    <Route path='dashboard' element={<WorkspaceDashboard />} />
                    <Route path='overview' element={<Workspace />} />
                    <Route path='tasks' element={<TasksPage />} />
                    <Route path='task/:taskId' element={<TaskDetails />} />
                    <Route path='notes' element={<Notes />} />
                    <Route path='calendar' element={<WorkspaceCalendar />} />
                    <Route path='team' element={
                      <TeamRouteGuard>
                        <TeamPage />
                      </TeamRouteGuard>
                    } />
                    <Route path='trash' element={<Trash />} />
                    <Route path='settings' element={<WorkspaceSettingsPage />} />
                  </Route>
                </Route>
                
                <Route path='*' element={<Navigate to='/dashboard' replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

function App() {
  const currentTheme = useSelector((state) => state.theme.current);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');

    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (currentTheme === 'light') {
      document.documentElement.classList.add('light');
    } else if (currentTheme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(isSystemDark ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [currentTheme]);

  return (
    <main className='w-full min-h-screen bg-[#f3f4f6] dark:bg-gray-900'>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/log-in' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/signup' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
        </Route>
        
        <Route path='/workspace/invitation' element={<WorkspaceInvitation />} />
        
        <Route path='/*' element={
          <RequireAuth>
            <WorkspaceInitializer />
            <Layout />
          </RequireAuth>
        } />

        <Route
          path="/workspaces/trash"
          element={
            <RequireAuth>
              <WorkspaceTrash />
            </RequireAuth>
          }
        />
      </Routes>
      <ToastConfig />
    </main>
  );
}

export default App;
