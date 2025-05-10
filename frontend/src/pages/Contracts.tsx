import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { contractService } from '../services/api';
import { Contract } from '../types';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await contractService.getAll();
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.delete(id);
        loadContracts();
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'erc20':
        return 'primary';
      case 'erc721':
        return 'secondary';
      case 'custom':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Smart Contracts</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {contracts.map((contract) => (
          <Box key={contract.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {contract.name}
                </Typography>
                <Chip 
                  label={contract.type.toUpperCase()} 
                  color={getTypeColor(contract.type)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleDelete(contract.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Contracts; 