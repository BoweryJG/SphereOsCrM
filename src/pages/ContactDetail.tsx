import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { fetchContactById } from '../services/supabase/supabaseService';
import { Contact } from '../types/models';
import CallButton from '../components/contacts/CallButton';
import CallHistory from '../components/contacts/CallHistory';
import ContactProcedureRecommendations from '../components/recommendations/ContactProcedureRecommendations';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await fetchContactById(id);
        
        if (error) {
          console.error('Error fetching contact:', error);
        } else if (data) {
          // Use the data directly since it matches the Contact interface
          const mappedContact: Contact = data;
          setContact(mappedContact);
        }
      } catch (error) {
        console.error('Error in contact fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    navigate(`/contacts/edit/${id}`);
  };

  const handleDelete = () => {
    // Implement delete functionality
    if (window.confirm('Are you sure you want to delete this contact?')) {
      // Delete contact logic here
      navigate('/contacts');
    }
  };

  const toggleStarred = async () => {
    if (!contact) return;
    
    // Toggle starred status
    setContact(prevContact => {
      if (!prevContact) return null;
      return {
        ...prevContact,
        status: prevContact.status === 'active' ? 'inactive' : 'active'
      };
    });
    
    // In a real app, this would update the database
    // await updateContact(contact.id, { status: contact.status === 'active' ? 'inactive' : 'active' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getContactInitials = (first_name: string, last_name: string) => {
    return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    // Generate a consistent color based on the contact's ID
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ];
    
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Contacts
        </Button>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Contact not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Contacts
        </Button>
        <Box>
          <IconButton onClick={toggleStarred} sx={{ mr: 1 }}>
            {contact.status === 'active' ? (
              <StarIcon sx={{ color: theme.palette.warning.main }} />
            ) : (
              <StarBorderIcon />
            )}
          </IconButton>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        <Box>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mb: 2,
                    bgcolor: getAvatarColor(contact.id),
                    fontSize: '2rem'
                  }}
                >
                  {getContactInitials(contact.first_name, contact.last_name)}
                </Avatar>
                <Typography variant="h4">
                  {contact.first_name} {contact.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {contact.title}
                </Typography>
                
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <CallButton contact={contact} />
                  <IconButton color="primary" aria-label="send email" sx={{ ml: 1 }}>
                    <EmailIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {contact.phone}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {contact.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Practice Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Practice ID: {contact.practice_id}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Type:
                  </Typography>
                  <Chip 
                    label={contact.specialization ? 
                      contact.specialization.charAt(0).toUpperCase() + contact.specialization.slice(1) : 
                      (contact.type || 'Unknown')} 
                    size="small" 
                    color={contact.specialization === 'dental' ? 'primary' : 'secondary'}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Additional Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Last Contacted:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(contact.last_contacted)}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  {contact.tags && contact.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Notes
            </Typography>
            <Typography variant="body1">
              {contact.notes || 'No notes available for this contact.'}
            </Typography>
          </Paper>
          
          {/* Call History Component */}
          <CallHistory contactId={contact.id} />
          
          {/* Procedure Recommendations */}
          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <ContactProcedureRecommendations
              contactId={contact.id}
              contactProfile={{
                name: `${contact.first_name} ${contact.last_name}`,
                previousProcedures: contact.tags || [],
                interests: contact.specialization ? [contact.specialization] : [],
                budget: 'medium'
              }}
              onProcedureAdd={(procedure) => {
                console.log('Adding procedure to treatment plan:', procedure);
                // TODO: Implement adding procedure to treatment plan
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactDetail;
