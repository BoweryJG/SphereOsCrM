import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { useAppMode } from '../contexts/AppModeContext';

type BillingCycle = 'monthly' | 'annual';
type SubscriptionTier = 'explorer' | 'professional' | 'growth' | 'enterprise' | 'elite';

const Subscribe: React.FC = () => {
  const theme = useTheme();
  const { mode } = useAppMode();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('professional');

  const handleBillingCycleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newBillingCycle: BillingCycle | null,
  ) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    // Set the selected tier before proceeding to checkout
    setSelectedTier(tier);
    
    // In a real implementation, we would pass the tier and billing cycle to the API
    const res = await fetch('/api/create-checkout-session', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tier,
        billingCycle
      })
    });
    
    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);
    }
  };

  // Pricing configuration - aligned with Canvas Header
  const pricing = {
    explorer: {
      monthly: 49,
      annual: 490, // ~2 months free
      features: {
        basic: [
          'Live mode access',
          '50 call recordings per month',
          'Basic call transcription',
          'Basic sentiment analysis',
          'Call tagging and organization',
          '10 linguistics analyses per month',
          'Export to PDF'
        ],
        premium: []
      }
    },
    professional: {
      monthly: 149,
      annual: 1490, // Save ~17%
      features: {
        basic: [
          'Everything in Explorer',
          '200 call recordings per month',
          'Full call transcription',
          'Advanced sentiment analysis',
          'Priority support',
          '50 linguistics analyses per month',
          'Export to PDF/Excel',
          'Basic analytics dashboard'
        ],
        premium: []
      }
    },
    growth: {
      monthly: 349,
      annual: 3490, // Save ~17%
      features: {
        basic: [
          'Everything in Professional',
          '500 call recordings per month',
          'Linguistics AI personalization',
          'Automated follow-ups',
          'Competition tracking',
          '150 linguistics analyses per month'
        ],
        premium: [
          'Advanced analytics dashboard',
          'Team sharing (up to 5)',
          'API access (limited)',
          'Priority support (2hr)'
        ]
      }
    },
    enterprise: {
      monthly: 749,
      annual: 7490, // Save ~17%
      features: {
        basic: [
          'Everything in Growth',
          '1,500 call recordings per month',
          'Unlimited CRM contacts',
          'Custom integrations',
          '500 linguistics analyses per month'
        ],
        premium: [
          'Dedicated success manager',
          'Advanced AI training',
          'Team sharing (up to 20)',
          'Full API access',
          'HIPAA compliance ready'
        ]
      }
    },
    elite: {
      monthly: 1499,
      annual: 14990, // Save ~17%
      features: {
        basic: [
          'Everything in Enterprise',
          'Unlimited call recordings',
          'Unlimited linguistics analyses',
          'White-label options',
          'Custom domain'
        ],
        premium: [
          'Dedicated infrastructure',
          '24/7 phone support',
          'Custom AI models',
          'Unlimited team members',
          'SLA guarantee',
          'Quarterly business reviews'
        ]
      }
    }
  };

  // Calculate savings for annual billing
  const getSavings = (tier: SubscriptionTier) => {
    const monthlyCost = pricing[tier].monthly;
    const annualCost = pricing[tier].annual;
    const monthlyCostForYear = monthlyCost * 12;
    const savings = monthlyCostForYear - annualCost;
    const savingsPercentage = Math.round((savings / monthlyCostForYear) * 100);
    return { savings, savingsPercentage };
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Unlock the full potential of SphereOS CRM with a plan that fits your needs
        </Typography>
        
        {/* Billing cycle toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            color="primary"
            value={billingCycle}
            exclusive
            onChange={handleBillingCycleChange}
            aria-label="billing cycle"
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              borderRadius: 2
            }}
          >
            <ToggleButton value="monthly" aria-label="monthly billing">
              Monthly
            </ToggleButton>
            <ToggleButton value="annual" aria-label="annual billing">
              Annual <Chip size="small" label="Save 17%" color="success" sx={{ ml: 1 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {/* Free Trial Note */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mb: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
            <Typography variant="body1" color="info.main">
              🎉 All plans include a 10-day free trial. No credit card required to start.
            </Typography>
          </Box>
        </Grid>
        
        {/* Render all tiers */}
        {Object.entries(pricing).map(([tierKey, tier], index) => {
          const isPopular = tierKey === 'professional';
          const isElite = tierKey === 'elite';
          
          return (
            <Grid item xs={12} sm={6} lg={index < 3 ? 4 : 3} key={tierKey}>
              <Paper 
                elevation={isPopular ? 6 : 3} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: isPopular ? `2px solid ${theme.palette.primary.main}` : 'none',
                  backgroundColor: isElite ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                {isPopular && (
                  <Chip 
                    label="MOST POPULAR" 
                    color="primary" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      fontWeight: 'bold'
                    }} 
                  />
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {tierKey}
                  </Typography>
                  {isElite && <StarIcon color="primary" sx={{ ml: 1 }} />}
                </Box>
                
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  ${tier[billingCycle]}
                  <Typography component="span" variant="body1" color="text.secondary">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </Typography>
                </Typography>
                
                {billingCycle === 'annual' && (
                  <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                    Save ${getSavings(tierKey as SubscriptionTier).savings}/year ({getSavings(tierKey as SubscriptionTier).savingsPercentage}% off)
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tierKey === 'explorer' && 'Perfect for individual sales reps getting started'}
                  {tierKey === 'professional' && 'Best for active sales professionals'}
                  {tierKey === 'growth' && 'Ideal for growing sales teams'}
                  {tierKey === 'enterprise' && 'For organizations requiring advanced features'}
                  {tierKey === 'elite' && 'Ultimate solution for large enterprises'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense sx={{ flexGrow: 1 }}>
                  {tier.features.basic.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                    </ListItem>
                  ))}
                  
                  {tier.features.premium.length > 0 && (
                    <>
                      <ListItem sx={{ pt: 1 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                          Premium Features:
                        </Typography>
                      </ListItem>
                      
                      {tier.features.premium.map((feature, featureIndex) => (
                        <ListItem key={`premium-${featureIndex}`} disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <StarIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ fontWeight: 'medium', fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </>
                  )}
                </List>
                
                <Button 
                  variant={isPopular || isElite ? "contained" : "outlined"} 
                  color="primary" 
                  fullWidth 
                  sx={{ 
                    mt: 2,
                    ...(isElite && {
                      backgroundColor: theme.palette.primary.dark,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      }
                    })
                  }}
                  onClick={() => handleSubscribe(tierKey as SubscriptionTier)}
                >
                  {tierKey === 'explorer' && 'Start Free Trial'}
                  {tierKey === 'professional' && 'Get Started'}
                  {tierKey === 'growth' && 'Scale Up'}
                  {tierKey === 'enterprise' && 'Go Enterprise'}
                  {tierKey === 'elite' && 'Contact Sales'}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Money-back guarantee and support info */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          All plans come with a 30-day money-back guarantee. No questions asked.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Need help choosing? Contact our sales team at sales@sphereoscrm.com
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          * Call recording limits refer to storage and transcription within Sphere oS CRM. 
          Actual Twilio calling charges are billed separately based on usage.
          Each account will need to configure their own Twilio phone number.
        </Typography>
      </Box>
    </Box>
  );
};

export default Subscribe;
