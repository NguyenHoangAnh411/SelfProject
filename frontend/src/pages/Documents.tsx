import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { documentService } from '../services/api';
import { Document } from '../types';
import { documentTemplates, DocumentTemplate } from '../templates/documentTemplates';
import { useNavigate } from 'react-router-dom';

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
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentService.getAll();
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplate(null);
    setTitle('');
    setTabValue(0);
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !title) return;

    try {
      await documentService.create({
        title,
        content: selectedTemplate.content
      });
      handleClose();
      loadDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.delete(id);
        loadDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTemplatesByCategory = (category: string) => {
    return Object.entries(documentTemplates)
      .filter(([_, template]) => template.category === category)
      .map(([key, template]) => ({ key, ...template }));
  };

  const handleDocumentClick = (id: string) => {
    navigate(`/documents/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          New Document
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {documents.map((document) => (
          <Box key={document._id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                  onClick={() => handleDocumentClick(document._id)}
                >
                  {document.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleDelete(document._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="template categories">
              <Tab label="Legal" />
              <Tab label="Business" />
              <Tab label="Policy" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {getTemplatesByCategory('legal').map((template) => (
                <Box key={template.key}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedTemplate?.title === template.title ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': {
                        borderColor: '#1976d2',
                      },
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{template.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {getTemplatesByCategory('business').map((template) => (
                <Box key={template.key}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedTemplate?.title === template.title ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': {
                        borderColor: '#1976d2',
                      },
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{template.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {getTemplatesByCategory('policy').map((template) => (
                <Box key={template.key}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedTemplate?.title === template.title ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      '&:hover': {
                        borderColor: '#1976d2',
                      },
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{template.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {selectedTemplate && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Template:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={selectedTemplate.title}
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedTemplate.description}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!selectedTemplate || !title}
          >
            Create Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents; 