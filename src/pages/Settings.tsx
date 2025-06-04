import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  useTheme,
  Tabs,
  Tab,
  Alert,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  AccountBox as AccountIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Phone as TwilioIcon
} from '@mui/icons-material';
import { useThemeContext } from '../themes/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import TwilioSettings from '../components/settings/TwilioSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const { themeMode } = useThemeContext();
  const [tabValue, setTabValue] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Settings state
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'EST',
    dateFormat: 'MM/DD/YYYY',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    callReminders: true,
    insightAlerts: true,
    weeklyReports: true,
    
    // Privacy & Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    dataSharing: false,
    analyticsTracking: true,
    
    // Communication
    defaultCallingNumber: '+18454090692',
    voicemailTranscription: true,
    recordCalls: true,
    
    // Display
    autoPlayVideos: false,
    darkMode: themeMode === 'space',
    compactView: false
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: themeMode === 'space' 
              ? 'linear-gradient(135deg, #8A60D0 0%, #6366F1 100%)'
              : themeMode === 'luxury'
              ? 'linear-gradient(135deg, #C9B037 0%, #FFD700 100%)'
              : 'linear-gradient(135deg, #3D52D5 0%, #6366F1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and system settings
        </Typography>
      </Box>

      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${
            themeMode === 'space' 
              ? 'rgba(255, 255, 255, 0.08)'
              : themeMode === 'luxury'
              ? 'rgba(201, 176, 55, 0.3)'
              : 'rgba(0, 0, 0, 0.06)'
          }`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 64
              }
            }}
          >
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Privacy & Security" />
            <Tab icon={<TwilioIcon />} label="Twilio" />
            <Tab icon={<PhoneIcon />} label="Communication" />
            <Tab icon={<PaletteIcon />} label="Appearance" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <MenuItem value="EST">Eastern (EST)</MenuItem>
                  <MenuItem value="CST">Central (CST)</MenuItem>
                  <MenuItem value="MST">Mountain (MST)</MenuItem>
                  <MenuItem value="PST">Pacific (PST)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Date Format"
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Notifications */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Communication Preferences
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" />
                        Email Notifications
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    }
                    label="Browser Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Alert Types
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.callReminders}
                        onChange={(e) => handleSettingChange('callReminders', e.target.checked)}
                      />
                    }
                    label="Call Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.insightAlerts}
                        onChange={(e) => handleSettingChange('insightAlerts', e.target.checked)}
                      />
                    }
                    label="Urgent Insights Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.weeklyReports}
                        onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                      />
                    }
                    label="Weekly Performance Reports"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Privacy & Security */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Account Security
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Two-Factor Authentication</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                    }
                  />
                  <TextField
                    select
                    label="Session Timeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    sx={{ maxWidth: 200 }}
                  >
                    <MenuItem value="15">15 minutes</MenuItem>
                    <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="60">1 hour</MenuItem>
                    <MenuItem value="240">4 hours</MenuItem>
                  </TextField>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Data & Privacy
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataSharing}
                        onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Data Sharing</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Share anonymized data to improve our services
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.analyticsTracking}
                        onChange={(e) => handleSettingChange('analyticsTracking', e.target.checked)}
                      />
                    }
                    label="Analytics Tracking"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Twilio Configuration */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <TwilioSettings />
          </Box>
        </TabPanel>

        {/* Communication */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Calling Number"
                  value={settings.defaultCallingNumber}
                  onChange={(e) => handleSettingChange('defaultCallingNumber', e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Call Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.voicemailTranscription}
                        onChange={(e) => handleSettingChange('voicemailTranscription', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Voicemail Transcription</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically transcribe voicemails to text
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.recordCalls}
                        onChange={(e) => handleSettingChange('recordCalls', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Record Calls</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically record calls for analysis
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Appearance */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Theme Selection
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <ThemeToggle />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Current theme: <Chip label={themeMode} size="small" />
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Display Options
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoPlayVideos}
                        onChange={(e) => handleSettingChange('autoPlayVideos', e.target.checked)}
                      />
                    }
                    label="Auto-play Videos"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.compactView}
                        onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                      />
                    }
                    label="Compact View"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Save Button */}
        <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            sx={{
              background: themeMode === 'space' 
                ? 'linear-gradient(135deg, #8A60D0 0%, #6366F1 100%)'
                : themeMode === 'luxury'
                ? 'linear-gradient(135deg, #C9B037 0%, #FFD700 100%)'
                : 'linear-gradient(135deg, #3D52D5 0%, #6366F1 100%)',
              '&:hover': {
                background: themeMode === 'space' 
                  ? 'linear-gradient(135deg, #7A50C0 0%, #5356E1 100%)'
                  : themeMode === 'luxury'
                  ? 'linear-gradient(135deg, #B9A027 0%, #EFC700 100%)'
                  : 'linear-gradient(135deg, #2D42C5 0%, #5356E1 100%)',
              }
            }}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;