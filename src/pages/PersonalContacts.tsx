import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxBlankIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { supabase } from '../services/supabase/supabase';
import { useAuth } from '../auth';
import CSVUploader from '../components/PersonalContacts/CSVUploader';

interface PersonalContact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  tags: string[];
  created_at: string;
  synced_to_crm?: boolean;
}

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
      id={`personal-contacts-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PersonalContacts: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [contacts, setContacts] = useState<PersonalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<GridRowSelectionModel>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personal_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCRM = async () => {
    if (!user || selectedContacts.length === 0) return;

    setSyncLoading(true);
    try {
      // Get selected contacts
      const contactsToSync = contacts.filter(c => selectedContacts.includes(c.id));
      
      // Transform for CRM
      const crmContacts = contactsToSync.map(contact => ({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        type: 'other' as const,
        status: 'lead' as const,
        practice_name: contact.company,
        title: contact.job_title,
        notes: `Imported from personal contacts`,
        tags: contact.tags,
        created_by: user.id,
        assigned_to: user.id
      }));

      // Insert into CRM
      const { data, error } = await supabase
        .from('contacts')
        .insert(crmContacts)
        .select();

      if (error) throw error;

      // Mark as synced in personal contacts
      await supabase
        .from('personal_contacts')
        .update({ custom_data: { synced_to_crm: true } })
        .in('id', selectedContacts);

      alert(`Successfully synced ${data?.length || 0} contacts to CRM!`);
      setShowSyncDialog(false);
      setSelectedContacts([]);
      loadContacts();
    } catch (error: any) {
      console.error('Sync error:', error);
      alert(`Error syncing contacts: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const exportContacts = () => {
    const csvContent = [
      // Headers
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Tags'].join(','),
      // Data
      ...contacts.map(contact => [
        contact.first_name || '',
        contact.last_name || '',
        contact.email || '',
        contact.phone || '',
        contact.company || '',
        contact.job_title || '',
        (contact.tags || []).join(';')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name?.toLowerCase().includes(searchLower) ||
      contact.last_name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.job_title?.toLowerCase().includes(searchLower)
    );
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: (params) => `${params.row.first_name || ''} ${params.row.last_name || ''}`.trim()
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'company', headerName: 'Company', flex: 1 },
    { field: 'job_title', headerName: 'Job Title', flex: 1 },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          {(params.value || []).slice(0, 2).map((tag: string, index: number) => (
            <Chip key={index} label={tag} size="small" />
          ))}
          {params.value?.length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      )
    },
    {
      field: 'synced',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        params.row.custom_data?.synced_to_crm ? (
          <Chip label="In CRM" size="small" color="success" />
        ) : (
          <Chip label="Personal" size="small" variant="outlined" />
        )
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Personal Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your private professional network - completely separate from the CRM
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportContacts}
            disabled={contacts.length === 0}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={() => setShowSyncDialog(true)}
            disabled={selectedContacts.length === 0}
          >
            Sync to CRM ({selectedContacts.length})
          </Button>
        </Box>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={`All Contacts (${contacts.length})`} />
            <Tab label="Import Contacts" icon={<UploadIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3, pb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Privacy Notice:</strong> These contacts are stored separately from the CRM and are only visible to you. 
                Use "Sync to CRM" to make selected contacts available in the main CRM system.
              </Typography>
            </Alert>

            <DataGrid
              rows={filteredContacts}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              autoHeight
              loading={loading}
              onRowSelectionModelChange={(newSelection) => setSelectedContacts(newSelection as string[])}
              rowSelectionModel={selectedContacts}
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none'
                }
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3, pb: 3 }}>
            <CSVUploader />
          </Box>
        </TabPanel>
      </Card>

      {/* Sync to CRM Dialog */}
      <Dialog
        open={showSyncDialog}
        onClose={() => setShowSyncDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sync to CRM</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will create {selectedContacts.length} new contacts in the CRM that will be visible to your team.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to sync these contacts to the main CRM?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSyncDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSyncToCRM}
            disabled={syncLoading}
          >
            {syncLoading ? 'Syncing...' : `Sync ${selectedContacts.length} Contacts`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PersonalContacts;