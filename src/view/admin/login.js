import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { TextField, Button, Grid, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import Toast from '../../utils/Toast';
import { useAuth } from "../../contexts/AuthContext";
import api from './../../api'

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
};

function Register() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const formDataChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    // validasi form
    if (
      !formData.username ||
      !formData.password

    ) {
      setError('Semua input wajib diisi!')
      setLoading(false)
      return;
    }
    try {
      const data = formData
      const response = await api.post(`/api/admin/protected`, data)

      if (response.status === 200) {
        Toast.fire({
          icon: 'success',
          title: 'Berhasil Login',
        });
        const { token } = response.data;
        loginAdmin(token);
        navigate('/admin/home')
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      setLoading(false)
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    const authAdminMessage = getCookie("authAdminMessage");
    if (authAdminMessage) {
      setExpiredMessage(authAdminMessage);
      removeCookie("authAdminMessage");
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Login | IF</title>
      </Helmet>
      <Container maxWidth="sm">
        <Box sx={{ mt: 20, p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            Admin Login
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='username'
                label="Username"
                value={formData.Username}
                onChange={formDataChange}
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='password'
                value={formData.Password}
                onChange={formDataChange}
                label="Password"
                type="password"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              {expiredMessage && (
                <Typography variant="body2" color="error" mb={2}>
                  {expiredMessage}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              {error && (
                <Typography variant="body2" color="error" mb={2}>
                  {error}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                type='submit'
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                sx={{ py: 1.5 }}
                disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>

  );
}

export default Register;
