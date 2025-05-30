import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CardHeader,
  CardContent,
  useTheme
} from '@mui/material';
import DashboardStats from '../components/dashboard/DashboardStats';
import QuickCallWidget from '../components/dashboard/QuickCallWidget';
import NowCardsStack from '../components/dashboard/NowCardsStack'; // Added import
import { useThemeContext } from '../themes/ThemeContext';
import { getMockDashboardData } from '../services/mockData/mockDataService';

// Helper function to generate random integers
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { themeMode } = useThemeContext();
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Load mock data on component mount
  useEffect(() => {
    const data = getMockDashboardData();
    setDashboardData(data);
    
    // Refresh data every 5 minutes to simulate real-time updates
    const intervalId = setInterval(() => {
      setDashboardData(getMockDashboardData());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Welcome back, John
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your sales performance and activity
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <DashboardStats />
      </Box>

      {/* Now Cards Stack - Added Section */}
      <Box sx={{ mb: 4 }}>
        <NowCardsStack />
      </Box>

      {/* Quick Actions and Communications */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          <Box>
            <QuickCallWidget />
          </Box>
          <Box>
            {/* Additional widgets can go here */}
          </Box>
        </Box>
      </Box>

      {/* Recent Activities and Upcoming Tasks */}
      <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            backgroundColor: themeMode === 'space'
              ? 'rgba(22, 27, 44, 0.7)'
              : theme.palette.background.paper,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${
              themeMode === 'space'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)'
            }`
          }}
        >
          <CardHeader
            title="Recent Activities"
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          />
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {dashboardData ? (
                dashboardData.recentActivities.map((activity: any) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: themeMode === 'space'
                        ? 'rgba(10, 14, 23, 0.5)'
                        : 'rgba(245, 247, 250, 0.5)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timeAgo}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {activity.type.includes('added') ? 'Added ' : ''}{activity.description}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Loading activities...
                </Typography>
              )}
            </Box>
          </CardContent>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: 3,
            backgroundColor: themeMode === 'space'
              ? 'rgba(22, 27, 44, 0.7)'
              : theme.palette.background.paper,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${
              themeMode === 'space'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)'
            }`
          }}
        >
          <CardHeader
            title="Upcoming Tasks"
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          />
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {dashboardData ? (
                dashboardData.upcomingTasks.map((task: any) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: themeMode === 'space'
                        ? 'rgba(10, 14, 23, 0.5)'
                        : 'rgba(245, 247, 250, 0.5)',
                      borderLeft: task.priority === 'High' ? `4px solid ${theme.palette.error.main}` : 
                                 task.priority === 'Medium' ? `4px solid ${theme.palette.warning.main}` : 
                                 `4px solid ${theme.palette.success.main}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {task.type}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={task.dueDate === 'Today' ? "error.main" : 
                               task.dueDate === 'Tomorrow' ? "warning.main" : 
                               "text.secondary"}
                      >
                        {task.dueDate}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {task.description}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Loading tasks...
                </Typography>
              )}
            </Box>
          </CardContent>
        </Paper>
      </Box>

      {/* Market Intelligence Preview */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: themeMode === 'space'
              ? 'rgba(22, 27, 44, 0.7)'
              : theme.palette.background.paper,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${
              themeMode === 'space'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)'
            }`
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Market Intelligence
          </Typography>
          <Typography variant="body2" paragraph>
            Recent trends in the dental implant market show a {getRandomInt(12, 18)}% increase in demand for minimally invasive procedures. 
            Aesthetic procedures, particularly for injectables, have seen a {getRandomInt(20, 25)}% growth in the last quarter.
          </Typography>
          <Typography variant="body2" paragraph>
            Key opportunity: Practices in your region are increasingly interested in combined treatment packages that 
            integrate both dental and aesthetic procedures for comprehensive patient care.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 2, color: 'text.secondary' }}>
            Market data refreshed {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
