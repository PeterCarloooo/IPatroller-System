import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captchaInput: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.captchaInput.toUpperCase() !== captchaText) {
      showToast('Invalid CAPTCHA code', 'error');
      generateCaptcha();
      setFormData(prev => ({ ...prev, captchaInput: '' }));
      return;
    }

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      showToast(error.message, 'error');
      generateCaptcha();
      setFormData(prev => ({ ...prev, captchaInput: '' }));
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
        <img 
          src="/favicon.svg" 
          alt="Logo" 
          style={{ width: '100px', marginBottom: '20px' }}
        />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          IPatroller System
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Sign in to start your session
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Security Check
              </Typography>
              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '24px',
                  userSelect: 'none',
                  mb: 2,
                  position: 'relative',
                }}
              >
                {captchaText}
              </Box>
              <TextField
                required
                fullWidth
                name="captchaInput"
                label="Enter text above"
                value={formData.captchaInput}
                onChange={handleInputChange}
              />
              <Button
                size="small"
                onClick={generateCaptcha}
                sx={{ mt: 1 }}
              >
                Can't read this? Try Another
              </Button>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 