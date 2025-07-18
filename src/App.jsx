import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Illegals from './components/Illegals';
import IPatroller from './components/IPatroller';
import CommandCenter from './components/CommandCenter';
import Report from './components/Report';
import Setup from './components/Setup';
import theme from './theme/theme';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Configure React Router future flags
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      suspense: false,
      useErrorBoundary: false,
      onError: (error) => {
        console.error('Query Error:', error);
      }
    },
    mutations: {
      useErrorBoundary: false,
      onError: (error) => {
        console.error('Mutation Error:', error);
      }
    }
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="illegals" element={<Illegals />} />
                  <Route path="ipatroller" element={<IPatroller />} />
                  <Route path="command-center" element={<CommandCenter />} />
                  <Route path="report" element={<Report />} />
                  <Route path="setup" element={<Setup />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
