import React, { useState, useEffect } from 'react';
import api from './../../api'
import { TextField, Button, Grid, Typography, Container, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import Toast from '../../utils/Toast';
import Dialog from '../../utils/Dialog';

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    badge: '',
    name: '',
    email: '',
    departement: '',
    area: '',
    supervisor_name: '',
    supervisor_email: '',
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
      !formData.badge ||
      !formData.name ||
      !formData.email ||
      !formData.departement ||
      !formData.area ||
      !formData.supervisor_name ||
      !formData.supervisor_email
    ) {
      setError('Semua input wajib diisi!')
      setLoading(false)
      return;
    }

    const result = await Dialog.fire({
      title: 'Anda yakin?',
      text: 'Pastikan data sudah di isi dengan benar!',
    });
    if (result.isConfirmed) {
      try {
        const data = formData
        const response = await api.post(`/api/register`, data)

        if (response.status === 201) {
          Toast.fire({
            icon: 'success',
            title: 'Berhasil Registrasi',
          });
          navigate('../')
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setError('User sudah terdaftar!');
        } else if (error.response.status === 400) {
          setError(
            error.response.data.errors[0].msg
          );
        } else {
          setError('Gagal melakukan pendaftaran.');
        }
      }
    }
  }


  return (
    <>
      <Helmet>
        <title>Register | IF</title>
      </Helmet>
      <Container maxWidth="sm">
        <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            Register
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='badge'
                label="Badge"
                value={formData.badge}
                onChange={formDataChange}
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='name'
                value={formData.name}
                onChange={formDataChange}
                label="Name"
                type="text"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='email'
                value={formData.email}
                onChange={formDataChange}
                label="Email"
                type="email"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='departement'
                value={formData.departement}
                onChange={formDataChange}
                label="Departement"
                type="text"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='area'
                value={formData.area}
                onChange={formDataChange}
                label="Area"
                type="text"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='supervisor_name'
                value={formData.supervisor_name}
                onChange={formDataChange}
                label="Supervisor Name"
                type="text"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='supervisor_email'
                value={formData.supervisor_email}
                onChange={formDataChange}
                label="Email Supervisor"
                type="email"
                variant="outlined"
                required />
            </Grid>
            <Grid item xs={12}>
              {error && <Alert severity='error'>{error}</Alert>}
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                sx={{ py: 1.5 }}>
                Register
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>

  );
}

export default Register;
