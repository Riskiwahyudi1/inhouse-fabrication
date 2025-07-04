import React, { useState, useEffect } from 'react'
import { Box, TextField, Grid, Typography, Button, Link, MenuItem, Alert, CircularProgress } from '@mui/material'
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom'
import Toast from '../../utils/Toast'
import Dialog from '../../utils/Dialog'
import axios from 'axios'
import api from './../../api'
const Home = () => {
    const initialFormData = {
        badge: '',
        part_name: '',
        quantity: '',
        machine_type: '',
        fabrication_type: '',
        crd: '',
        description: '',
    }
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(initialFormData)

    const formDataChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');


        // validasi form

        if (
            !formData.badge ||
            !formData.part_name ||
            !formData.quantity ||
            !formData.machine_type ||
            !formData.fabrication_type ||
            !formData.crd ||
            !formData.description
        ) {
            setError('Semua input wajib diisi!');
            setLoading(false);
            return;
        }

        const result = await Dialog.fire({
            title: 'Anda yakin?',
            text: 'Pastikan data sudah di isi dengan benar!',
        });
        if (result.isConfirmed) {
            setLoading(true);
            try {
                const data = formData;
                const response = await api.post(`/api/request-item/create-request`, data);

                if (response.status === 201) {
                    Toast.fire({
                        icon: 'success',
                        title: 'Request anda berhasil dibuat.'
                    })
                    setFormData(initialFormData)
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setError('badge belum terdaftar!');
                } else if (error.response.status === 400) {
                    setError(
                        error.response.data.errors[0].msg
                    );
                } else {
                    setError('Gagal menambahkan User.');
                }
            } finally {
                setLoading(false);
            }
        }

    }

    return (
        <>
            <Helmet>
                <title>Form Request | IF</title>
            </Helmet>
            <Box sx={{ flexGrow: 1, padding: 6 }}>
                <Grid container spacing={2}>
                    {/* Setiap input dalam Grid item */}
                    <Grid item xs={12} sm={4}>
                        <Typography sx={{ my: 1 }}>Badge</Typography>
                        <TextField
                            name='badge'
                            value={formData.badge}
                            onChange={formDataChange}
                            label="Input Badge with B"
                            variant="outlined"
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography sx={{ my: 1 }}>Part Name</Typography>
                        <TextField
                            name='part_name'
                            value={formData.part_name}
                            onChange={formDataChange}
                            label="Input Part Name"
                            variant="outlined"
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography sx={{ my: 1 }}>Machine Type</Typography>
                                <TextField
                                    label="Select Machine Type"
                                    variant="outlined"
                                    name='machine_type'
                                    value={formData.machine_type}
                                    onChange={formDataChange}
                                    fullWidth
                                    select >
                                    <MenuItem value="3d-printing">3D Printing</MenuItem>
                                    <MenuItem value="cnc-milling">CNC Milling</MenuItem>
                                    <MenuItem value="Cleaning Jig">Cleaning Jig</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{ my: 1 }}>Fabrication Type</Typography>
                                <TextField
                                    label="Select Fabrication Type"
                                    variant="outlined"
                                    name='fabrication_type'
                                    value={formData.fabrication_type}
                                    onChange={formDataChange}
                                    fullWidth
                                    select >
                                    <MenuItem value="Prototype">Prototype</MenuItem>
                                    <MenuItem value="Production Use">Production Use</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography sx={{ my: 1 }}>Quantity</Typography>
                        <TextField
                            name='quantity'
                            value={formData.quantity}
                            onChange={formDataChange}
                            label="Input Quantity"
                            type='number'
                            variant="outlined"
                            fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography sx={{ my: 1 }}>CRD</Typography>
                        <TextField
                            name='crd'
                            value={formData.crd}
                            onChange={formDataChange}
                            label="Select CRD"
                            type='date'
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography sx={{ my: 1 }}>Link Quotation</Typography>
                                <TextField
                                    name='link_quantation'
                                    value={formData.link_quantation}
                                    onChange={formDataChange}
                                    label="Input Link Quotation"
                                    variant="outlined"
                                    fullWidth />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{ my: 1 }}>Link Drawing</Typography>
                                <TextField
                                    name='link_drawing'
                                    value={formData.link_drawing}
                                    onChange={formDataChange}
                                    label="Input Link Drawing"
                                    variant="outlined"
                                    fullWidth />
                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{ my: 2 }}>Desctiption</Typography>
                    <TextField
                        fullWidth
                        name='description'
                        value={formData.description}
                        onChange={formDataChange}
                        label="Input Desctiption"
                        variant="outlined"
                        multiline
                        rows={3}
                    />
                </Grid>
                {error && <Alert severity='error'>{error}</Alert>}
                <Grid>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: "#00A63F",
                            textTransform: "none",
                            color: "#fff",
                            my: 5,
                            paddingX: 6,
                            mx: "auto",
                            display: "block",
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Request Now"}
                    </Button>
                </Grid>
                <Grid>
                    <Typography>
                        Save file Quantation on: <Link href="#">Click This Link</Link>
                    </Typography>
                    <Typography>
                        Save file Drawing on: <Link href="#">Click This Link</Link>
                    </Typography>
                </Grid>
            </Box>
        </>
    )
}

export default Home