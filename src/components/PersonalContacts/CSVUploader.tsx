import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { supabase } from '../../services/supabase/supabase';
import { useAuth } from '../../auth';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

const STANDARD_FIELDS = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Full Name', value: 'full_name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Work Phone', value: 'work_phone' },
  { label: 'Company', value: 'company' },
  { label: 'Job Title', value: 'job_title' },
  { label: 'Department', value: 'department' },
  { label: 'Website', value: 'website' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Address Line 1', value: 'address_line1' },
  { label: 'Address Line 2', value: 'address_line2' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
  { label: 'Zip Code', value: 'zip_code' },
  { label: 'Country', value: 'country' },
  { label: 'Notes', value: 'notes' },
  { label: 'Tags', value: 'tags' }
];

const CSVUploader: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [selectedForCRM, setSelectedForCRM] = useState<Set<string>>(new Set());
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            const headers = Object.keys(result.data[0] as any);
            setCSVHeaders(headers);
            setCSVData(result.data as CSVRow[]);
            
            // Auto-map columns based on common names
            const autoMappings = headers.map(header => {
              const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
              const matchedField = STANDARD_FIELDS.find(field => {
                const normalizedField = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normalizedField === normalizedHeader || 
                       normalizedHeader.includes(normalizedField) ||
                       normalizedField.includes(normalizedHeader);
              });
              
              return {
                csvColumn: header,
                dbField: matchedField?.value || 'skip'
              };
            });
            
            setColumnMappings(autoMappings);
            setActiveStep(1);
          }
        },
        header: true,
        skipEmptyLines: true
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const handleMappingChange = (csvColumn: string, dbField: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, dbField } 
          : mapping
      )
    );
  };

  const importContacts = async () => {
    if (!user) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setActiveStep(2);

    const batchId = `import_${Date.now()}`;
    const totalRows = csvData.length;
    let importedRows = 0;
    let failedRows = 0;
    const errors: any[] = [];

    try {
      // Process in batches of 100
      const batchSize = 100;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        const contactsToImport = batch.map(row => {
          const contact: any = {
            user_id: user.id,
            source: 'csv_import',
            import_batch_id: batchId
          };

          // Map CSV columns to database fields
          columnMappings.forEach(mapping => {
            if (mapping.dbField !== 'skip' && row[mapping.csvColumn]) {
              if (mapping.dbField === 'tags') {
                // Handle tags as array
                contact[mapping.dbField] = row[mapping.csvColumn].split(',').map(tag => tag.trim());
              } else {
                contact[mapping.dbField] = row[mapping.csvColumn];
              }
            }
          });

          // Store unmapped fields in custom_data
          const customData: any = {};
          Object.keys(row).forEach(key => {
            const isMapped = columnMappings.some(m => m.csvColumn === key && m.dbField !== 'skip');
            if (!isMapped && row[key]) {
              customData[key] = row[key];
            }
          });
          
          if (Object.keys(customData).length > 0) {
            contact.custom_data = customData;
          }

          return contact;
        });

        // Insert batch
        const { data, error } = await supabase
          .from('personal_contacts')
          .upsert(contactsToImport, {
            onConflict: 'user_id,email',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          failedRows += batch.length;
          errors.push({ batch: i / batchSize, error: error.message });
        } else {
          importedRows += data?.length || 0;
        }

        setUploadProgress((i + batch.length) / totalRows * 100);
      }

      // Record import history
      await supabase.from('personal_contacts_import_history').insert({
        user_id: user.id,
        batch_id: batchId,
        file_name: 'CSV Import',
        total_rows: totalRows,
        imported_rows: importedRows,
        failed_rows: failedRows,
        error_details: errors.length > 0 ? { errors } : null
      });

      setUploadResults({
        total: totalRows,
        imported: importedRows,
        failed: failedRows,
        errors
      });

      setUploadStatus(failedRows === 0 ? 'success' : 'error');
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus('error');
      setUploadResults({
        total: totalRows,
        imported: importedRows,
        failed: totalRows - importedRows,
        errors: [{ general: (error as Error).message }]
      });
    }
  };

  const handleSyncToCRM = async () => {
    if (!user || selectedForCRM.size === 0) return;

    try {
      // Get selected contacts
      const { data: contacts, error } = await supabase
        .from('personal_contacts')
        .select('*')
        .eq('user_id', user.id)
        .in('id', Array.from(selectedForCRM));

      if (error) throw error;

      // Transform and insert into CRM contacts
      const crmContacts = contacts?.map(contact => ({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || contact.mobile || contact.work_phone,
        type: 'other' as const,
        status: 'lead' as const,
        practice_name: contact.company,
        title: contact.job_title,
        notes: `Imported from personal contacts. ${contact.notes || ''}`,
        created_by: user.id,
        assigned_to: user.id
      }));

      const { error: insertError } = await supabase
        .from('contacts')
        .insert(crmContacts);

      if (insertError) throw insertError;

      alert(`Successfully synced ${selectedForCRM.size} contacts to CRM!`);
      setShowSyncDialog(false);
      setSelectedForCRM(new Set());
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing contacts to CRM');
    }
  };

  const downloadTemplate = () => {
    const template = STANDARD_FIELDS.map(field => field.label).join(',');
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
  };

  const steps = ['Upload CSV', 'Map Columns', 'Import Results'];

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Import Personal Contacts</Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            variant="outlined"
          >
            Download Template
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your personal contacts are completely private and separate from the CRM. 
            You can choose to sync specific contacts to the CRM later.
          </Typography>
        </Alert>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files
            </Typography>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map CSV Columns to Contact Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've auto-detected some mappings. Please review and adjust as needed.
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>CSV Column</TableCell>
                    <TableCell>Sample Data</TableCell>
                    <TableCell>Map to Field</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvHeaders.map((header, index) => (
                    <TableRow key={header}>
                      <TableCell>{header}</TableCell>
                      <TableCell>
                        <Typography variant="caption" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                          {csvData[0]?.[header] || '(empty)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={columnMappings.find(m => m.csvColumn === header)?.dbField || 'skip'}
                          onChange={(e) => handleMappingChange(header, e.target.value)}
                        >
                          <MenuItem value="skip">
                            <em>Skip this column</em>
                          </MenuItem>
                          {STANDARD_FIELDS.map(field => (
                            <MenuItem key={field.value} value={field.value}>
                              {field.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between">
              <Button onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {csvData.length} contacts will be imported
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={importContacts}
                  disabled={!columnMappings.some(m => m.dbField !== 'skip')}
                >
                  Import Contacts
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            {uploadStatus === 'uploading' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Importing Contacts...
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(uploadProgress)}% complete
                </Typography>
              </Box>
            )}

            {uploadStatus !== 'uploading' && uploadResults && (
              <Box>
                <Box display="flex" alignItems="center" mb={3}>
                  {uploadStatus === 'success' ? (
                    <CheckIcon color="success" sx={{ fontSize: 48, mr: 2 }} />
                  ) : (
                    <ErrorIcon color="error" sx={{ fontSize: 48, mr: 2 }} />
                  )}
                  <Box>
                    <Typography variant="h6">
                      Import {uploadStatus === 'success' ? 'Successful' : 'Completed with Errors'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {uploadResults.imported} of {uploadResults.total} contacts imported successfully
                    </Typography>
                  </Box>
                </Box>

                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {uploadResults.failed} contacts failed to import
                    </Typography>
                    {uploadResults.errors.map((error: any, index: number) => (
                      <Typography key={index} variant="caption" display="block">
                        {error.general || `Batch ${error.batch}: ${error.error}`}
                      </Typography>
                    ))}
                  </Alert>
                )}

                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActiveStep(0);
                      setCSVData([]);
                      setColumnMappings([]);
                      setUploadResults(null);
                      setUploadStatus('idle');
                    }}
                  >
                    Import More Contacts
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<SyncIcon />}
                    onClick={() => setShowSyncDialog(true)}
                  >
                    Sync to CRM
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Sync to CRM Dialog */}
        <Dialog
          open={showSyncDialog}
          onClose={() => setShowSyncDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Sync Contacts to CRM</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select which contacts you want to sync to the main CRM. 
              This will create new CRM contacts that are visible to your team.
            </Alert>
            {/* Add contact selection UI here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSyncDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSyncToCRM}
              disabled={selectedForCRM.size === 0}
            >
              Sync {selectedForCRM.size} Contacts
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CSVUploader;