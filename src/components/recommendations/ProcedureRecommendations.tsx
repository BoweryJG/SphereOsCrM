import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  Button,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ExpandMore,
  TrendingUp,
  AttachMoney,
  Psychology,
  LocalOffer,
  ContentCopy,
  Storefront,
  Search,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Lightbulb,
  AutoAwesome,
  Timeline,
  Groups,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import marketDataService, { 
  ProcedureRecommendation, 
  EnrichedProcedure,
  MarketModeData,
  SalesModeData,
  SEOModeData 
} from '../../services/marketData/marketDataService';

interface ProcedureRecommendationsProps {
  practiceId?: string;
  contactId?: string;
  practiceProfile?: {
    type: string;
    size: string;
    procedures: string[];
    annual_revenue?: number;
  };
  onProcedureSelect?: (procedure: EnrichedProcedure) => void;
}

const DifficultyChip: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const color = difficulty === 'low' ? 'success' : difficulty === 'medium' ? 'warning' : 'error';
  const icon = difficulty === 'low' ? <CheckCircle /> : difficulty === 'medium' ? <Warning /> : <ErrorIcon />;
  
  return (
    <Chip
      size="small"
      icon={icon}
      label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      color={color}
      variant="outlined"
    />
  );
};

const FitScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const theme = useTheme();
  const getColor = () => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={60}
        thickness={6}
        sx={{
          color: getColor(),
          [`& .${CircularProgress.root}`]: {
            circle: {
              strokeLinecap: 'round',
            },
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary" fontWeight={600}>
          {score}%
        </Typography>
      </Box>
    </Box>
  );
};

const ModeContent: React.FC<{ 
  procedure: EnrichedProcedure; 
  mode: 'market' | 'sales' | 'seo' 
}> = ({ procedure, mode }) => {
  const theme = useTheme();
  const modeData = marketDataService.getModeData(procedure, mode);
  
  if (!modeData) return <Typography variant="body2" color="text.secondary">No {mode} data available</Typography>;
  
  if (mode === 'market') {
    const marketData = modeData as MarketModeData;
    return (
      <Stack spacing={2}>
        {marketData.global_market_value && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Market Value</Typography>
            <Typography variant="body2">{marketData.global_market_value}</Typography>
          </Box>
        )}
        {marketData.growth_rate && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Growth Rate</Typography>
            <Chip 
              icon={<TrendingUp />} 
              label={marketData.growth_rate} 
              size="small" 
              color="success" 
              variant="outlined"
            />
          </Box>
        )}
        {marketData.market_leaders && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Market Leaders</Typography>
            <Typography variant="body2">{marketData.market_leaders.join(', ')}</Typography>
          </Box>
        )}
        {marketData.trend_alert && (
          <Alert severity="info" icon={<Lightbulb />} sx={{ mt: 1 }}>
            {marketData.trend_alert}
          </Alert>
        )}
      </Stack>
    );
  }
  
  if (mode === 'sales') {
    const salesData = modeData as SalesModeData;
    return (
      <Stack spacing={2}>
        {salesData.elevator_pitch && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Elevator Pitch</Typography>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="body2">{salesData.elevator_pitch}</Typography>
              <IconButton size="small" sx={{ mt: 1 }}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        )}
        {salesData.roi_calculator && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>ROI Calculator</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Procedure Revenue</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${salesData.roi_calculator.procedure_revenue?.toLocaleString() || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Lifetime Value</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${salesData.roi_calculator.lifetime_maintenance?.toLocaleString() || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        {salesData.bundle_opportunities && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Bundle Opportunities</Typography>
            <Chip icon={<LocalOffer />} label="Cross-sell Available" size="small" color="secondary" />
          </Box>
        )}
      </Stack>
    );
  }
  
  if (mode === 'seo') {
    const seoData = modeData as SEOModeData;
    return (
      <Stack spacing={2}>
        {seoData.primary_keywords && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Top Keywords</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {Object.entries(seoData.primary_keywords).slice(0, 3).map(([keyword, volume]) => (
                <Chip
                  key={keyword}
                  label={`${keyword} (${volume})`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
        {seoData.competitive_edge && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Competitive Edge</Typography>
            <Typography variant="body2">{seoData.competitive_edge}</Typography>
          </Box>
        )}
        {seoData.local_domination && (
          <Alert severity="success" sx={{ mt: 1 }}>
            {seoData.local_domination}
          </Alert>
        )}
      </Stack>
    );
  }
  
  return null;
};

const RecommendationCard: React.FC<{ 
  recommendation: ProcedureRecommendation;
  onSelect?: (procedure: EnrichedProcedure) => void;
}> = ({ recommendation, onSelect }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'market' | 'sales' | 'seo'>('market');
  const { procedure, fit_score, reasoning, opportunity_size, implementation_difficulty } = recommendation;
  
  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'market' | 'sales' | 'seo' | null) => {
    if (newMode !== null) {
      setSelectedMode(newMode);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Accordion
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
          '&:before': { display: 'none' },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FitScoreIndicator score={fit_score} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" fontWeight={600}>
                {procedure.procedure_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {procedure.category} • ${procedure.average_cost_usd?.toLocaleString() || 'N/A'}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <DifficultyChip difficulty={implementation_difficulty} />
                {procedure.robotics_ai_used && (
                  <Chip
                    icon={<AutoAwesome />}
                    label="AI/Robotics"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Chip
                  icon={<AttachMoney />}
                  label={`$${(opportunity_size / 1000).toFixed(0)}K potential`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(procedure);
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add to Pipeline
              </Button>
            </Grid>
          </Grid>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ pt: 2 }}>
            {/* Reasoning Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Why This Procedure?
              </Typography>
              <Stack spacing={1}>
                {reasoning.map((reason, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Psychology fontSize="small" sx={{ color: theme.palette.primary.main, mt: 0.3 }} />
                    <Typography variant="body2">{reason}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            
            {/* Mode Toggle */}
            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={selectedMode}
                exclusive
                onChange={handleModeChange}
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="market">
                  <TrendingUp sx={{ mr: 1 }} />
                  Market
                </ToggleButton>
                <ToggleButton value="sales">
                  <Storefront sx={{ mr: 1 }} />
                  Sales
                </ToggleButton>
                <ToggleButton value="seo">
                  <Search sx={{ mr: 1 }} />
                  SEO
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Mode Content */}
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <ModeContent procedure={procedure} mode={selectedMode} />
            </Paper>
            
            {/* Key Metrics */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Patient Satisfaction</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {procedure.patient_satisfaction_score}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Market Growth</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {procedure.yearly_growth_percentage}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">US Market Size</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ${(procedure.market_size_us / 1000).toFixed(1)}B
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Complexity</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {procedure.complexity}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
};

export const ProcedureRecommendations: React.FC<ProcedureRecommendationsProps> = ({
  practiceId,
  contactId,
  practiceProfile = {
    type: 'dental',
    size: 'medium',
    procedures: ['Teeth Whitening', 'Dental Implants', 'Root Canal'],
    annual_revenue: 1500000
  },
  onProcedureSelect
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
        const recs = await marketDataService.getRecommendations(practiceProfile);
        setRecommendations(recs);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load procedure recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [practiceProfile]);
  
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Analyzing practice profile and market opportunities...
        </Typography>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <Alert severity="info">
        No procedure recommendations available at this time.
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AutoAwesome sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight={600}>
            AI-Powered Procedure Recommendations
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Based on your practice profile, market trends, and growth opportunities
        </Typography>
      </Box>
      
      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.08) }}>
            <Typography variant="h4" fontWeight={600} color="success.main">
              {recommendations.filter(r => r.fit_score >= 80).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High-Fit Procedures
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
            <Typography variant="h4" fontWeight={600} color="primary.main">
              ${(recommendations.reduce((sum, r) => sum + r.opportunity_size, 0) / 1000000).toFixed(1)}M
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Opportunity
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Timeline sx={{ color: theme.palette.secondary.main }} />
              <Typography variant="h4" fontWeight={600} color="secondary.main">
                {Math.round(recommendations.reduce((sum, r) => sum + r.procedure.yearly_growth_percentage, 0) / recommendations.length)}%
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Avg Market Growth
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recommendations List */}
      <AnimatePresence>
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.procedure.id}
            recommendation={recommendation}
            onSelect={onProcedureSelect}
          />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default ProcedureRecommendations;