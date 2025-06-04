import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  alpha,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Refresh,
  Speed,
} from '@mui/icons-material';
import {
  QuotaGauge2D,
  PipelineGauge2D,
  RevenueGauge2D,
  WinRateGauge2D,
  ActivityGauge2D,
} from '../gauges/VintageGauge2D';
import VintageGauge2D from '../gauges/VintageGauge2D';
import { motion } from 'framer-motion';

interface GaugeMetric {
  current: number;
  target?: number;
  trend?: number;
  lastUpdated?: Date;
}

interface DashboardMetrics {
  quota: GaugeMetric;
  pipeline: GaugeMetric;
  revenue: GaugeMetric;
  winRate: GaugeMetric;
  activity: GaugeMetric;
  marketShare: GaugeMetric;
  opportunityScore: GaugeMetric;
}

const mockMetrics: DashboardMetrics = {
  quota: { current: 87, target: 100, trend: 5.2 },
  pipeline: { current: 72, target: 80, trend: -2.1 },
  revenue: { current: 285, target: 350, trend: 12.5 },
  winRate: { current: 42, target: 50, trend: 3.8 },
  activity: { current: 68, target: 75, trend: -1.5 },
  marketShare: { current: 23, target: 30, trend: 2.1 },
  opportunityScore: { current: 82, target: 85, trend: 4.7 },
};

const GaugeCard: React.FC<{
  title: string;
  metric: GaugeMetric;
  gauge: React.ReactNode;
  info?: string;
}> = ({ title, metric, gauge, info }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 3,
          height: '100%',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {info && (
              <Tooltip title={info}>
                <IconButton size="small">
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          
          {metric.target && (
            <Typography variant="body2" color="text.secondary">
              Target: {metric.target}
            </Typography>
          )}
        </Box>
        
        {/* Gauge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          {gauge}
        </Box>
        
        {/* Trend */}
        {metric.trend && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Chip
              icon={metric.trend > 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${metric.trend > 0 ? '+' : ''}${metric.trend}%`}
              size="small"
              color={metric.trend > 0 ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}
        
        {/* Decorative gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '40%',
            background: `radial-gradient(circle, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      </Paper>
    </motion.div>
  );
};

export const VintageGaugeDashboard: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshMetrics = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setMetrics({
        ...metrics,
        quota: { ...metrics.quota, current: metrics.quota.current + Math.random() * 10 - 5 },
        pipeline: { ...metrics.pipeline, current: metrics.pipeline.current + Math.random() * 10 - 5 },
        revenue: { ...metrics.revenue, current: metrics.revenue.current + Math.random() * 20 - 10 },
        winRate: { ...metrics.winRate, current: metrics.winRate.current + Math.random() * 5 - 2.5 },
        activity: { ...metrics.activity, current: metrics.activity.current + Math.random() * 10 - 5 },
      });
      setIsRefreshing(false);
    }, 1000);
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Performance Command Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time sales metrics and market intelligence
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Speed />}
              label="Live Data"
              color="success"
              variant="outlined"
            />
            <IconButton onClick={refreshMetrics} disabled={isRefreshing}>
              <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
      
      {/* Primary Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sales Performance
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <GaugeCard
              title="Quota Attainment"
              metric={metrics.quota}
              gauge={<QuotaGauge2D value={metrics.quota.current} />}
              info="Percentage of quarterly quota achieved"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GaugeCard
              title="Pipeline Health"
              metric={metrics.pipeline}
              gauge={<PipelineGauge2D value={metrics.pipeline.current} />}
              info="Quality score of active opportunities"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GaugeCard
              title="Monthly Revenue"
              metric={metrics.revenue}
              gauge={<RevenueGauge2D value={metrics.revenue.current} />}
              info="Total revenue this month in thousands"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GaugeCard
              title="Win Rate"
              metric={metrics.winRate}
              gauge={<WinRateGauge2D value={metrics.winRate.current} />}
              info="Percentage of opportunities won"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Secondary Metrics */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Activity & Market Intelligence
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <GaugeCard
              title="Activity Score"
              metric={metrics.activity}
              gauge={<ActivityGauge2D value={metrics.activity.current} />}
              info="Combined score of calls, emails, and meetings"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <GaugeCard
              title="Territory Market Share"
              metric={metrics.marketShare}
              gauge={<VintageGauge2D 
                value={metrics.marketShare.current} 
                min={0}
                max={100}
                label="MARKET SHARE"
                unit="%"
                redZone={[0, 15]}
                yellowZone={[15, 30]}
              />}
              info="Your share of the addressable market"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <GaugeCard
              title="Opportunity Score"
              metric={metrics.opportunityScore}
              gauge={<VintageGauge2D 
                value={metrics.opportunityScore.current}
                min={0}
                max={100}
                label="OPPORTUNITY"
                unit="pts"
                redZone={[0, 30]}
                yellowZone={[30, 70]}
              />}
              info="AI-calculated score of untapped opportunities"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* CSS for rotation animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default VintageGaugeDashboard;