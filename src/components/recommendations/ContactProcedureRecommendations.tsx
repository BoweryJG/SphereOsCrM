import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Stack,
  Button,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  Divider,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Psychology,
  AttachMoney,
  Schedule,
  Person,
  CheckCircle,
  LocalHospital,
  Spa,
  AutoAwesome,
  TrendingUp,
  Star,
  Info,
  Add,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import marketDataService, { 
  EnrichedProcedure,
  ProcedureRecommendation 
} from '../../services/marketData/marketDataService';

interface ContactProcedureRecommendationsProps {
  contactId: string;
  contactProfile?: {
    name: string;
    age?: number;
    gender?: string;
    previousProcedures?: string[];
    interests?: string[];
    budget?: string;
  };
  onProcedureAdd?: (procedure: EnrichedProcedure) => void;
  compact?: boolean;
}

const ProcedureCard: React.FC<{
  procedure: EnrichedProcedure;
  recommendation?: ProcedureRecommendation;
  onAdd?: (procedure: EnrichedProcedure) => void;
  compact?: boolean;
}> = ({ procedure, recommendation, onAdd, compact }) => {
  const theme = useTheme();
  const isDental = procedure.category?.toLowerCase().includes('dental');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        }}
      >
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          {/* Header with Icon */}
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Avatar
              sx={{
                bgcolor: isDental ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                color: isDental ? theme.palette.primary.main : theme.palette.secondary.main,
              }}
            >
              {isDental ? <LocalHospital /> : <Spa />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant={compact ? "body1" : "h6"} fontWeight={600}>
                {procedure.procedure_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {procedure.category}
              </Typography>
            </Box>
            {recommendation && (
              <Chip
                label={`${recommendation.fit_score}%`}
                size="small"
                color={recommendation.fit_score >= 80 ? 'success' : recommendation.fit_score >= 60 ? 'warning' : 'default'}
                icon={<AutoAwesome />}
              />
            )}
          </Stack>
          
          {!compact && (
            <>
              {/* Price and Duration */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AttachMoney fontSize="small" sx={{ color: theme.palette.success.main }} />
                    <Typography variant="body2" fontWeight={600}>
                      ${procedure.average_cost_usd?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Average cost
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Schedule fontSize="small" sx={{ color: theme.palette.info.main }} />
                    <Typography variant="body2" fontWeight={600}>
                      {procedure.complexity === 'Low' ? '30-60 min' : procedure.complexity === 'Medium' ? '1-2 hrs' : '2+ hrs'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Patient Satisfaction */}
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Patient Satisfaction
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {procedure.patient_satisfaction_score}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={procedure.patient_satisfaction_score || 0}
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    },
                  }}
                />
              </Box>
              
              {/* Key Benefits */}
              {recommendation && recommendation.reasoning.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Why this procedure?
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {recommendation.reasoning.slice(0, 2).map((reason, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                        <CheckCircle sx={{ fontSize: 14, color: theme.palette.success.main, mt: 0.2 }} />
                        <Typography variant="caption">{reason}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              
              {/* Tags */}
              <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {procedure.robotics_ai_used && (
                  <Chip label="AI-Assisted" size="small" variant="outlined" />
                )}
                {procedure.yearly_growth_percentage && procedure.yearly_growth_percentage > 10 && (
                  <Chip 
                    label={`${procedure.yearly_growth_percentage}% growth`} 
                    size="small" 
                    variant="outlined"
                    icon={<TrendingUp />}
                  />
                )}
                <Chip 
                  label={procedure.complexity} 
                  size="small" 
                  variant="outlined"
                  color={procedure.complexity === 'Low' ? 'success' : procedure.complexity === 'Medium' ? 'warning' : 'error'}
                />
              </Box>
            </>
          )}
          
          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            size={compact ? "small" : "medium"}
            startIcon={<Add />}
            onClick={() => onAdd?.(procedure)}
            sx={{ mt: compact ? 1.5 : 2 }}
          >
            Add to Treatment Plan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ContactProcedureRecommendations: React.FC<ContactProcedureRecommendationsProps> = ({
  contactId,
  contactProfile = {
    name: 'John Doe',
    age: 45,
    previousProcedures: ['Teeth Whitening'],
    interests: ['aesthetic', 'preventive care'],
    budget: 'medium'
  },
  onProcedureAdd,
  compact = false
}) => {
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState<ProcedureRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate practice profile based on contact
        const practiceProfile = {
          type: 'dental',
          size: 'medium',
          procedures: contactProfile.previousProcedures || [],
          annual_revenue: 1500000
        };
        
        const recs = await marketDataService.getRecommendations(practiceProfile);
        
        // Filter based on contact interests and budget
        const filteredRecs = recs.filter(rec => {
          if (contactProfile.budget === 'low' && rec.procedure.average_cost_usd > 2000) return false;
          if (contactProfile.budget === 'medium' && rec.procedure.average_cost_usd > 5000) return false;
          return true;
        });
        
        setRecommendations(filteredRecs.slice(0, compact ? 3 : 6));
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load procedure recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [contactId, contactProfile, compact]);
  
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Analyzing patient profile...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      {!compact && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Psychology sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={600}>
              Personalized Treatment Recommendations
            </Typography>
            <Tooltip title="AI-powered recommendations based on patient profile, history, and market trends">
              <IconButton size="small">
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          
          {/* Patient Context */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
            <Chip
              icon={<Person />}
              label={`${contactProfile.name}, ${contactProfile.age || 'N/A'}`}
              size="small"
              variant="outlined"
            />
            {contactProfile.previousProcedures && contactProfile.previousProcedures.length > 0 && (
              <Chip
                label={`${contactProfile.previousProcedures.length} previous procedures`}
                size="small"
                variant="outlined"
              />
            )}
            {contactProfile.budget && (
              <Chip
                label={`${contactProfile.budget} budget`}
                size="small"
                variant="outlined"
                color={contactProfile.budget === 'high' ? 'success' : contactProfile.budget === 'medium' ? 'warning' : 'default'}
              />
            )}
          </Stack>
        </Box>
      )}
      
      {/* Recommendations Grid */}
      <Grid container spacing={2}>
        {recommendations.map((rec) => (
          <Grid item xs={12} sm={compact ? 12 : 6} md={compact ? 12 : 4} key={rec.procedure.id}>
            <ProcedureCard
              procedure={rec.procedure}
              recommendation={rec}
              onAdd={onProcedureAdd}
              compact={compact}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* View More */}
      {compact && recommendations.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="text" size="small">
            View All Recommendations
          </Button>
        </Box>
      )}
      
      {/* Combo Deal Alert */}
      {!compact && recommendations.length >= 2 && (
        <Alert
          severity="info"
          icon={<AutoAwesome />}
          sx={{ mt: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small">
              Create Bundle
            </Button>
          }
        >
          <Typography variant="body2" fontWeight={600}>
            Bundle Opportunity Detected!
          </Typography>
          <Typography variant="caption">
            Combining {recommendations[0].procedure.procedure_name} with {recommendations[1].procedure.procedure_name} could save the patient 15% and increase practice revenue by $
            {Math.round((recommendations[0].procedure.average_cost_usd + recommendations[1].procedure.average_cost_usd) * 0.85).toLocaleString()}.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ContactProcedureRecommendations;