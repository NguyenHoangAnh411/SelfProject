import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Alert, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail(token!);
      if (response.success) {
        setSuccess('Email verified successfully! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.error || 'Email verification failed');
      }
    } catch (err) {
      setError('An error occurred during email verification');
    }
  };

  const handleResendVerification = async () => {
    try {
      const email = searchParams.get('email');
      if (!email) {
        setError('Email address not found');
        return;
      }
      const response = await authService.resendVerification(email);
      if (response.success) {
        setSuccess('Verification email has been resent. Please check your inbox.');
      } else {
        setError(response.error || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('An error occurred while resending verification email');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Email Verification
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {success}
          </Alert>
        )}
        {error && !success && (
          <Button
            variant="contained"
            onClick={handleResendVerification}
            sx={{ mt: 2 }}
          >
            Resend Verification Email
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail; 
 