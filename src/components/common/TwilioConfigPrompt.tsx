import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TwilioConfigPromptProps {
  open: boolean;
  onClose: () => void;
}

const TwilioConfigPrompt: React.FC<TwilioConfigPromptProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleSetupClick = () => {
    onClose();
    navigate('/settings/twilio');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PhoneIcon color="primary" />
          <Typography variant="h6">Set Up Your Twilio Account</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          To make calls with Sphere oS CRM, you need to configure your own Twilio account.
          This ensures your calls are private and billed directly to you.
        </Alert>

        <Typography variant="body1" gutterBottom>
          Benefits of your own Twilio account:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Complete Privacy"
              secondary="Your calls and data remain completely private"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <AccountIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Your Own Phone Number"
              secondary="Use your business number for all outbound calls"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Direct Billing"
              secondary="Pay Twilio directly at their competitive rates"
            />
          </ListItem>
        </List>

        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Setup Process:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Sign up for a free Twilio account<br />
            2. Purchase a phone number (~$1/month)<br />
            3. Copy your credentials to Sphere oS<br />
            4. Start making calls immediately!
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Typical Twilio costs: $0.0085/minute for US calls + $1/month per phone number
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Later
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSetupClick}
          startIcon={<PhoneIcon />}
        >
          Set Up Twilio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwilioConfigPrompt;