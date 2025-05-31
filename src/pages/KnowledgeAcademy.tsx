import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  useTheme,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import {
  School as SchoolIcon,
  LocalHospital as DentalIcon,
  Psychology as AestheticIcon,
  TrendingUp as TrendingIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  EmojiEvents as CertificateIcon,
  Groups as CommunityIcon,
  Timeline as ProgressIcon,
  Lightbulb as InsightIcon
} from '@mui/icons-material';
import { useThemeContext } from '../themes/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { DentalProceduresService } from '../services/knowledgeBase/dentalProcedures';
import { AestheticProceduresService } from '../services/knowledgeBase/aestheticProcedures';

const KnowledgeAcademy: React.FC = () => {
  const theme = useTheme();
  const { themeMode } = useThemeContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    dentalProcedures: 0,
    aestheticProcedures: 0,
    totalLearningHours: 0,
    userProgress: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dentalData, aestheticData] = await Promise.all([
          DentalProceduresService.getAllProcedures(),
          AestheticProceduresService.getAllProcedures()
        ]);
        
        setStats({
          dentalProcedures: dentalData.length,
          aestheticProcedures: aestheticData.length,
          totalLearningHours: Math.floor((dentalData.length + aestheticData.length) * 1.5), // Mock calc
          userProgress: Math.floor(Math.random() * 100) // Mock progress
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const academyFeatures = [
    {
      id: 'dental',
      title: 'Dental Procedures',
      subtitle: 'Master dental procedures and technologies',
      description: `${stats.dentalProcedures} procedures available for learning`,
      icon: <DentalIcon fontSize="large" />,
      color: theme.palette.primary.main,
      path: '/knowledge/dental',
      stats: {
        procedures: stats.dentalProcedures,
        videos: '200+',
        quizzes: '50+',
        certificates: '5'
      }
    },
    {
      id: 'aesthetic',
      title: 'Aesthetic Procedures',
      subtitle: 'Learn aesthetic and cosmetic procedures',
      description: `${stats.aestheticProcedures} procedures with comprehensive guides`,
      icon: <AestheticIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      path: '/knowledge/aesthetic',
      stats: {
        procedures: stats.aestheticProcedures,
        videos: '300+',
        quizzes: '75+',
        certificates: '8'
      }
    }
  ];

  const learningPaths = [
    {
      id: 'beginner',
      title: 'Beginner Essentials',
      description: 'Start your journey with fundamental concepts',
      duration: '2-4 weeks',
      modules: 12,
      progress: 25,
      color: theme.palette.success.main
    },
    {
      id: 'intermediate',
      title: 'Advanced Techniques',
      description: 'Deep dive into complex procedures and technologies',
      duration: '4-6 weeks',
      modules: 18,
      progress: 60,
      color: theme.palette.warning.main
    },
    {
      id: 'expert',
      title: 'Expert Mastery',
      description: 'Master cutting-edge innovations and leadership',
      duration: '6-8 weeks',
      modules: 24,
      progress: 15,
      color: theme.palette.error.main
    }
  ];

  const achievements = [
    { icon: '🏆', title: 'Top Learner', description: 'Completed 50+ procedures' },
    { icon: '⚡', title: 'Quick Study', description: 'Finished 10 modules in a week' },
    { icon: '🎯', title: 'Quiz Master', description: 'Perfect scores on 20 quizzes' },
    { icon: '💎', title: 'Expert', description: 'Achieved mastery certification' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          📚 Knowledge Academy
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Master medical and aesthetic procedures with our comprehensive learning platform
        </Typography>
        
        {/* Overall Progress */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Your Learning Journey
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {stats.userProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.userProgress}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {stats.totalLearningHours}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Learning Hours
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="secondary.main">
                {stats.dentalProcedures + stats.aestheticProcedures}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Procedures
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                12
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Certificates Earned
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Main Learning Areas */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🎯 Choose Your Learning Path
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {academyFeatures.map((feature) => (
          <Grid item xs={12} md={6} key={feature.id}>
            <Card
              elevation={4}
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[12]
                }
              }}
            >
              <CardActionArea onClick={() => navigate(feature.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: `${feature.color}20`,
                        color: feature.color
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {feature.subtitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color={feature.color}>
                          {feature.stats.procedures}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Procedures
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color={feature.color}>
                          {feature.stats.videos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Videos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color={feature.color}>
                          {feature.stats.quizzes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quizzes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color={feature.color}>
                          {feature.stats.certificates}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Certificates
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Learning Paths */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🛤️ Structured Learning Paths
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {learningPaths.map((path) => (
          <Grid item xs={12} md={4} key={path.id}>
            <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {path.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {path.description}
                </Typography>
                
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">Progress</Typography>
                    <Typography variant="caption">{path.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={path.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: path.color,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip label={`${path.modules} modules`} size="small" />
                  <Chip label={path.duration} size="small" variant="outlined" />
                </Box>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 2 }}
                  onClick={() => navigate('/knowledge/dental')} // Could be dynamic
                >
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Achievements Section */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        🏆 Your Achievements
      </Typography>
      
      <Grid container spacing={2}>
        {achievements.map((achievement, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.shadows[6]
                }
              }}
            >
              <Typography variant="h3" sx={{ mb: 1 }}>
                {achievement.icon}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {achievement.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {achievement.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KnowledgeAcademy;