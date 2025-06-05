import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  MicOff as MicOffIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import { callContact, updateCallStatus } from '../../services/twilio/twilioService';
import { useAuth } from '../../hooks/useAuth';
import { Contact } from '../../types/models';

interface CallButtonProps {
  contact: Contact;
}

const CallButton: React.FC<CallButtonProps> = ({ contact }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'in-progress' | 'completed' | 'failed'>('idle');
  const [callSid, setCallSid] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callActivityId, setCallActivityId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'successful' | 'unsuccessful' | 'follow_up_required' | 'no_decision'>('successful');
  const [nextSteps, setNextSteps] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to format seconds into MM:SS format
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to handle initiating a call
  const handleCall = async () => {
    setIsDialogOpen(true);
    setCallState('connecting');
    
    try {
      // Make the call using Twilio
      const userId = user?.id || 'anonymous';
      const result = await callContact(contact, userId);
      
      if (result.success && result.callSid) {
        setCallSid(result.callSid);
        setCallState('in-progress');
        
        // Start tracking call duration
        const interval = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        setDurationInterval(interval);
      } else {
        setCallState('failed');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallState('failed');
    }
  };

  // Function to handle ending a call
  const handleEndCall = async () => {
    if (callSid) {
      try {
        // Update call status in Supabase
        await updateCallStatus({
          callSid,
          status: 'completed',
          duration: callDuration
        });
        
        // Clear the duration interval
        if (durationInterval) {
          clearInterval(durationInterval);
          setDurationInterval(null);
        }
        
        setCallState('completed');
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    // If call is still in progress, end it first
    if (callState === 'in-progress' && callSid) {
      handleEndCall();
    }
    
    // Reset all states
    setIsDialogOpen(false);
    setCallState('idle');
    setCallSid(null);
    setCallDuration(0);
    setCallActivityId(null);
    setNotes('');
    setOutcome('successful');
    setNextSteps('');
    setIsMuted(false);
    setIsSpeakerOn(true);
    
    if (durationInterval) {
      clearInterval(durationInterval);
      setDurationInterval(null);
    }
  };

  // Function to toggle mute
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would interact with the actual call
  };

  // Function to toggle speaker
  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, this would interact with the actual call
  };

  return (
    <>
      <IconButton 
        color="primary" 
        onClick={handleCall}
        aria-label="call contact"
      >
        <PhoneIcon />
      </IconButton>
      
      {/* Call Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={callState !== 'in-progress' ? handleCloseDialog : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {callState === 'connecting' && 'Connecting...'}
          {callState === 'in-progress' && 'Call in Progress'}
          {callState === 'completed' && 'Call Completed'}
          {callState === 'failed' && 'Call Failed'}
        </DialogTitle>
        
        <DialogContent>
          <Box 
            display="flex"
            flexDirection="column"
            alignItems="center"
            my={2}
          >
            {/* Contact info */}
            <Typography variant="h6">
              {contact.first_name} {contact.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Practice ID: {contact.practice_id}
            </Typography>
            
            {/* Call status */}
            <Box sx={{ mt: 3, mb: 2 }}>
              {callState === 'connecting' && (
                <CircularProgress size={60} />
              )}
              
              {callState === 'in-progress' && (
                <>
                  <Chip 
                    label="Call in progress" 
                    color="success" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                    {formatDuration(callDuration)}
                  </Typography>
                </>
              )}
              
              {callState === 'completed' && (
                <>
                  <Chip 
                    label="Call ended" 
                    color="default" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography variant="body1">
                    Duration: {formatDuration(callDuration)}
                  </Typography>
                </>
              )}
              
              {callState === 'failed' && (
                <Chip 
                  label="Call failed" 
                  color="error" 
                  sx={{ mb: 2 }} 
                />
              )}
            </Box>
            
            {/* Call controls - only show during active call */}
            {callState === 'in-progress' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
                <IconButton 
                  onClick={handleToggleMute}
                  color={isMuted ? 'default' : 'primary'}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '50%',
                    p: 1
                  }}
                >
                  {isMuted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
                
                <IconButton 
                  onClick={handleEndCall}
                  color="error"
                  sx={{ 
                    border: `1px solid ${theme.palette.error.main}`,
                    borderRadius: '50%',
                    p: 1
                  }}
                >
                  <CallEndIcon />
                </IconButton>
                
                <IconButton 
                  onClick={handleToggleSpeaker}
                  color={isSpeakerOn ? 'primary' : 'default'}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '50%',
                    p: 1
                  }}
                >
                  {isSpeakerOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Box>
            )}
          </Box>
          
          {/* Call notes and outcome - show when call is completed */}
          {(callState === 'completed' || callState === 'failed') && (
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Call Notes"
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="call-outcome-label">Call Outcome</InputLabel>
                <Select
                  labelId="call-outcome-label"
                  value={outcome}
                  label="Call Outcome"
                  onChange={(e) => setOutcome(e.target.value as any)}
                >
                  <MenuItem value="successful">Successful</MenuItem>
                  <MenuItem value="unsuccessful">Unsuccessful</MenuItem>
                  <MenuItem value="follow_up_required">Follow-up Required</MenuItem>
                  <MenuItem value="no_decision">No Decision</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Next Steps"
                fullWidth
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          {callState === 'in-progress' ? (
            <Button 
              onClick={handleEndCall} 
              color="error" 
              variant="contained"
              startIcon={<CallEndIcon />}
            >
              End Call
            </Button>
          ) : (
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CallButton;
