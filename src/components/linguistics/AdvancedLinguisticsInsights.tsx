import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Avatar,
  useTheme,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { ComprehensiveLinguisticsAnalysis } from '../../services/linguistics/advancedLinguisticsService';

interface AdvancedLinguisticsInsightsProps {
  analysis: ComprehensiveLinguisticsAnalysis;
}

const AdvancedLinguisticsInsights: React.FC<AdvancedLinguisticsInsightsProps> = ({ analysis }) => {
  const theme = useTheme();

  // Format personality type display
  const formatPersonalityType = (type: string) => {
    const typeMap = {
      analytical: { label: 'Analytical', color: theme.palette.info.main, icon: '🔍' },
      driver: { label: 'Driver', color: theme.palette.error.main, icon: '🎯' },
      expressive: { label: 'Expressive', color: theme.palette.warning.main, icon: '💫' },
      amiable: { label: 'Amiable', color: theme.palette.success.main, icon: '🤝' }
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, color: theme.palette.grey[500], icon: '👤' };
  };

  // Prepare data for influence techniques radar chart
  const influenceData = Object.entries(analysis.powerAnalysis.influenceTechniques).map(([key, value]) => ({
    technique: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  // Color mapping for sentiment
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  return (
    <Box>
      {/* Psychological Profile Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">Psychological Profile</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default', height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Personality Type
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: formatPersonalityType(analysis.psychologicalProfile.personalityType).color, width: 56, height: 56 }}>
                        <Typography variant="h4">
                          {formatPersonalityType(analysis.psychologicalProfile.personalityType).icon}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Typography variant="h5">
                          {formatPersonalityType(analysis.psychologicalProfile.personalityType).label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.confidenceScore}% confidence
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Decision Style</Typography>
                      <Chip label={analysis.psychologicalProfile.decisionMakingStyle} size="small" color="primary" />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Communication</Typography>
                      <Chip label={analysis.psychologicalProfile.communicationStyle} size="small" color="secondary" />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Risk Tolerance</Typography>
                      <Chip label={analysis.psychologicalProfile.riskTolerance} size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Price Sensitivity</Typography>
                      <Chip label={analysis.psychologicalProfile.pricesensitivity} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Key Motivators & Concerns</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Trust Factors
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {analysis.psychologicalProfile.trustFactors.map((factor, index) => (
                        <Chip key={index} label={factor} size="small" variant="outlined" color="success" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Motivational Triggers
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {analysis.psychologicalProfile.motivationalTriggers.map((trigger, index) => (
                        <Chip key={index} label={trigger} size="small" variant="outlined" color="primary" />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Concerns & Objections
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {analysis.psychologicalProfile.concernsAndObjections.map((concern, index) => (
                        <Chip key={index} label={concern} size="small" variant="outlined" color="error" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Conversation Dynamics Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" />
            <Typography variant="h6">Conversation Dynamics</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Talk Time Balance</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Rep</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysis.conversationDynamics.talkTimeRatio.rep} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">{analysis.conversationDynamics.talkTimeRatio.rep}%</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Prospect</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysis.conversationDynamics.talkTimeRatio.prospect} 
                        color="secondary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">{analysis.conversationDynamics.talkTimeRatio.prospect}%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Question Technique</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Open Questions" secondary={analysis.conversationDynamics.questioningTechnique.openQuestions} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Closed Questions" secondary={analysis.conversationDynamics.questioningTechnique.closedQuestions} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Leading Questions" secondary={analysis.conversationDynamics.questioningTechnique.leadingQuestions} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Interaction Patterns</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {analysis.conversationDynamics.interruptionPattern.repInterruptions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rep Interruptions
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {analysis.conversationDynamics.interruptionPattern.prospectInterruptions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prospect Interruptions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Power Analysis Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoGraphIcon color="primary" />
            <Typography variant="h6">Power Dynamics & Influence</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Influence Techniques</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={influenceData}>
                      <PolarGrid stroke={theme.palette.divider} />
                      <PolarAngleAxis dataKey="technique" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar name="Score" dataKey="score" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Power Dynamic</Typography>
                    <Chip 
                      label={analysis.powerAnalysis.overallPowerDynamic.replace('_', ' ').toUpperCase()} 
                      color={analysis.powerAnalysis.overallPowerDynamic === 'rep_dominant' ? 'success' : 'warning'}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Persuasion Effectiveness</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysis.powerAnalysis.persuasionEffectiveness} 
                        sx={{ flex: 1, height: 10, borderRadius: 5 }}
                        color={analysis.powerAnalysis.persuasionEffectiveness > 70 ? 'success' : 'warning'}
                      />
                      <Typography variant="h6">
                        {analysis.powerAnalysis.persuasionEffectiveness}%
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Control Moments
                  </Typography>
                  {analysis.powerAnalysis.controlMoments.map((moment, index) => (
                    <Alert 
                      key={index} 
                      severity={moment.controlShift === 'to_rep' ? 'success' : 'warning'}
                      sx={{ mb: 1 }}
                    >
                      <AlertTitle>{moment.timestamp}</AlertTitle>
                      {moment.trigger} - {moment.impact} impact
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sales Insights Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">Sales Intelligence</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Win Probability</Typography>
                    <Typography variant="h4" color={analysis.salesInsights.winProbability > 70 ? 'success.main' : 'warning.main'}>
                      {analysis.salesInsights.winProbability}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Call Stage
                    </Typography>
                    <Chip 
                      label={analysis.salesInsights.callStage.replace('_', ' ').toUpperCase()} 
                      color="primary"
                    />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Buying Signals Detected
                  </Typography>
                  <List dense>
                    {analysis.salesInsights.buyingSignals.map((signal, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip 
                            label={signal.strength} 
                            size="small"
                            color={signal.strength === 'strong' ? 'success' : signal.strength === 'medium' ? 'warning' : 'default'}
                          />
                        </ListItemIcon>
                        <ListItemText primary={signal.signal} secondary={signal.timestamp} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Recommended Follow-Up</Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <AlertTitle>{analysis.salesInsights.recommendedFollowUp.timing}</AlertTitle>
                    {analysis.salesInsights.recommendedFollowUp.approach}
                  </Alert>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Next Best Actions
                  </Typography>
                  <List dense>
                    {analysis.salesInsights.nextBestActions.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FlagIcon color="action" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Coaching Opportunities Section */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">Coaching Insights</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {analysis.coachingOpportunities.map((opportunity, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1">{opportunity.area}</Typography>
                      <Chip 
                        label={opportunity.priority} 
                        size="small"
                        color={opportunity.priority === 'high' ? 'error' : opportunity.priority === 'medium' ? 'warning' : 'default'}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Current Level</Typography>
                        <Typography variant="body2" fontWeight="bold">{opportunity.currentLevel}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={opportunity.currentLevel}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={opportunity.currentLevel > 70 ? 'success' : 'warning'}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      <LightbulbIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {opportunity.improvement}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Key Moments Section */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon color="primary" />
            <Typography variant="h6">Critical Moments</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {analysis.keyMoments.map((moment, index) => (
              <ListItem key={index} sx={{ bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  {moment.significance === 'critical' ? (
                    <WarningIcon color="error" />
                  ) : moment.significance === 'important' ? (
                    <FlagIcon color="warning" />
                  ) : (
                    <LightbulbIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={moment.moment}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {moment.timestamp} • {moment.significance}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        💡 {moment.recommendation}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AdvancedLinguisticsInsights;