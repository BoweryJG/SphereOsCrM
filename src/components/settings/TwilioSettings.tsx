import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Link,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error } from '@mui/icons-material';
import { supabase } from '../../services/supabase/supabase';
import { useAuth } from '../../auth';

interface TwilioConfig {
  account_sid: string;
  auth_token: string;
  api_key: string;
  api_secret: string;
  phone_number: string;
  twiml_app_sid: string;
  is_configured: boolean;
  is_verified: boolean;
}

const TwilioSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState({
    auth_token: false,
    api_secret: false
  });
  
  const [config, setConfig] = useState<TwilioConfig>({
    account_sid: '',
    auth_token: '',
    api_key: '',
    api_secret: '',
    phone_number: '',
    twiml_app_sid: '',
    is_configured: false,
    is_verified: false
  });

  useEffect(() => {
    if (user) {
      loadTwilioConfig();
    }
  }, [user]);

  const loadTwilioConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_twilio_config')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        setConfig(data);
        if (data.is_configured) {
          setActiveStep(3); // Go to completed step
        }
      }
    } catch (err) {
      console.error('Error loading Twilio config:', err);
      setError('Failed to load Twilio configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TwilioConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig({ ...config, [field]: event.target.value });
    setError(null);
  };

  const toggleShowSecret = (field: 'auth_token' | 'api_secret') => {
    setShowSecrets({ ...showSecrets, [field]: !showSecrets[field] });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return config.account_sid.length > 0 && config.auth_token.length > 0;
      case 1:
        return config.phone_number.length > 0;
      case 2:
        return config.api_key.length > 0 && config.api_secret.length > 0 && config.twiml_app_sid.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const saveTwilioConfig = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const configData = {
        user_id: user.id,
        ...config,
        is_configured: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_twilio_config')
        .upsert(configData, { onConflict: 'user_id' });

      if (error) throw error;

      setSuccess('Twilio configuration saved successfully!');
      setConfig({ ...config, is_configured: true });
      
      // Reload the page after 2 seconds to apply new config
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Error saving Twilio config:', err);
      setError(err.message || 'Failed to save Twilio configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const steps = [
    {
      label: 'Twilio Account',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your Twilio account credentials. You can find these in your{' '}
            <Link href="https://console.twilio.com" target="_blank" rel="noopener">
              Twilio Console
            </Link>
            .
          </Typography>
          <TextField
            fullWidth
            label="Account SID"
            value={config.account_sid}
            onChange={handleInputChange('account_sid')}
            margin="normal"
            required
            helperText="Format: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <TextField
            fullWidth
            label="Auth Token"
            type={showSecrets.auth_token ? 'text' : 'password'}
            value={config.auth_token}
            onChange={handleInputChange('auth_token')}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleShowSecret('auth_token')} edge="end">
                    {showSecrets.auth_token ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      )
    },
    {
      label: 'Phone Number',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your Twilio phone number. This should be a number you've purchased from Twilio.
          </Typography>
          <TextField
            fullWidth
            label="Twilio Phone Number"
            value={config.phone_number}
            onChange={handleInputChange('phone_number')}
            margin="normal"
            required
            placeholder="+1234567890"
            helperText="Include country code (e.g., +1 for US)"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This phone number will be used for all your outbound calls and will only be associated with your account.
          </Alert>
        </Box>
      )
    },
    {
      label: 'API Credentials',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Create API credentials in your{' '}
            <Link href="https://console.twilio.com/us1/account/keys" target="_blank" rel="noopener">
              Twilio API Keys
            </Link>
            {' '}section.
          </Typography>
          <TextField
            fullWidth
            label="API Key SID"
            value={config.api_key}
            onChange={handleInputChange('api_key')}
            margin="normal"
            required
            helperText="Format: SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <TextField
            fullWidth
            label="API Secret"
            type={showSecrets.api_secret ? 'text' : 'password'}
            value={config.api_secret}
            onChange={handleInputChange('api_secret')}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleShowSecret('api_secret')} edge="end">
                    {showSecrets.api_secret ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            fullWidth
            label="TwiML App SID"
            value={config.twiml_app_sid}
            onChange={handleInputChange('twiml_app_sid')}
            margin="normal"
            required
            helperText="Format: APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Need help?{' '}
            <Link href="/docs/twilio-setup" target="_blank">
              View our Twilio setup guide
            </Link>
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" gutterBottom>
            Twilio Configuration
          </Typography>
          {config.is_configured && (
            <Chip
              icon={<CheckCircle />}
              label="Configured"
              color="success"
              size="small"
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? saveTwilioConfig : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={saving}
                  >
                    {index === steps.length - 1 ? (
                      saving ? 'Saving...' : 'Save Configuration'
                    ) : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && config.is_configured && (
          <Box mt={3}>
            <Alert severity="success">
              <Typography variant="body2">
                Your Twilio configuration is complete! Your phone number{' '}
                <strong>{config.phone_number}</strong> is now active and ready for use.
              </Typography>
            </Alert>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              sx={{ mt: 2 }}
            >
              Update Configuration
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TwilioSettings;