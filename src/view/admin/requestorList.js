import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableContainer, TableHead, Alert, TableRow, Paper, TableCell, Box, InputBase, MenuItem, Button, Modal, Grid, Container, Typography, TextField, CircularProgress
} from '@mui/material';
import { Helmet } from "react-helmet-async";
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { formatDate } from '../../utils/isoDate'
import axios from 'axios'
import Dialog from '../../utils/Dialog';
import Toast from '../../utils/Toast';
import { useAuth } from '../../contexts/AuthContext';
import api from './../../api'


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${theme.head}`]: {
        backgroundColor: '#B0BEC5',
        color: theme.palette.common.white,
        fontWeight: 'bold',
    },
    [`&.${theme.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#ECEFF1',
    },
    '&:nth-of-type(even)': {
        backgroundColor: '#CFD8DC',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px',
    border: '1px solid #ccc',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
    width: 500,
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: 24,
    padding: theme.spacing(4),
    outline: 'none',
}));

function ItemRequest() {
    const { adminToken } = useAuth();
    const [listDataRequestor, setDataRequestor] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [selectedIdUser, setSelectedIdUser] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formDataEdit, setFormDataEdit] = useState({
        badge: '',
        name: '',
        email: '',
        supervisor_name: '',
        supervisor_email: '',
        departement: '',
        area: '',
    })
   

    // set  form data edit
    useEffect(() => {
        if (listDataRequestor && selectedIdUser) {
            const data = listDataRequestor.find(item => item._id === selectedIdUser);
            if (data) {
                setFormDataEdit(prev => ({
                    ...prev,
                    badge: data.badge || '',
                    name: data.name || '',
                    email: data.email || '',
                    supervisor_name: data.supervisor_name || '',
                    supervisor_email: data.supervisor_email || '',
                    departement: data.departement || '',
                    area: data.area || '',
                }));
            }
        }
    }, [listDataRequestor, selectedIdUser]);

    // edit data proccess
    const formDataEditChange = (e) => {
        setFormDataEdit({
            ...formDataEdit,
            [e.target.name]: e.target.value
        });
    }
    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // validasi form
        if (
            !formDataEdit.badge ||
            !formDataEdit.name ||
            !formDataEdit.email ||
            !formDataEdit.supervisor_name ||
            !formDataEdit.supervisor_email ||
            !formDataEdit.departement ||
            !formDataEdit.area 
        ) {
            setError('Semua input wajib diisi!');
            setLoading(false);
            return;
        }
        try {
            const data = formDataEdit;
            const response = await api.put(`/api/admin/requestor-list/edit`, data,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    }
                }
            );
            if (response.status === 200) {
                Toast.fire({
                    icon: 'success',
                    title: 'Data berhasil diubah.'
                })
            }
            handleCloseModalEdit()
            setSubmitSuccess(!submitSuccess);
        } catch (error) {
            if (error.response.status === 400) {
                setError(
                    error.response.data.errors[0].msg
                );
            } else {
                setError('Gagal mengubah data.');
            }
        } finally {
            setLoading(false);
        }

    }

    // get sata proccess
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get('/api/admin/requestor-list');
                setDataRequestor(response.data)
            } catch (error) {
                setError('gagal memuat product.')
            }
        }
        fetchRequest()
    }, [submitSuccess])



    // modal handle
    const handleOpenModalEdit = (id) => {
        setSelectedIdUser(id)
        setFormDataEdit({...formDataEdit, id_user: id})
        setOpenModalEdit(true);
    };

    const handleCloseModalEdit = () => {
        setOpenModalEdit(false);
        setSelectedIdUser(null);
    };
    return (
        <>
            <Helmet>
                <title>Requestor List | IF</title>
            </Helmet>
            <Box sx={{ mb: 2, mt:4,  maxWidth: 400, display: 'flex', alignItems: 'center' }}>
                <Search sx={{ flexGrow: 1 }}>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <InputBase
                        placeholder="Search…"
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ MaxWidth: 500, }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>No</StyledTableCell>
                            <StyledTableCell>Badge</StyledTableCell>
                            <StyledTableCell>Nama</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Nama Supervisor</StyledTableCell>
                            <StyledTableCell>Email Supervisor</StyledTableCell>
                            <StyledTableCell>Departement</StyledTableCell>
                            <StyledTableCell>Area</StyledTableCell>
                            <StyledTableCell align="center">ACTION</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listDataRequestor?.length > 0 ? (
                            listDataRequestor.map((data, idx) => (
                                <StyledTableRow key={idx}>
                                    <StyledTableCell>{idx + 1}</StyledTableCell>
                                    <StyledTableCell>{data.badge}</StyledTableCell>
                                    <StyledTableCell>{data.name}</StyledTableCell>
                                    <StyledTableCell>{data.email}</StyledTableCell>
                                    <StyledTableCell>{data.supervisor_name}</StyledTableCell>
                                    <StyledTableCell>{data.supervisor_email}</StyledTableCell>
                                    <StyledTableCell>{data.departement}</StyledTableCell>
                                    <StyledTableCell>{data.area}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleOpenModalEdit(data._id)}
                                        >
                                            Edit
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        ) : (
                            <StyledTableRow>
                                <StyledTableCell colSpan={9} align="center">
                                    Tidak ada data yang tersedia
                                </StyledTableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <StyledModal open={openModalEdit} onClose={handleCloseModalEdit}>
                <ModalContent
                    sx={{
                        padding: 3,
                        borderRadius: 2,
                        boxShadow: 24,
                        maxWidth: 700,
                        maxHeight: '90vh',
                        margin: 'auto',
                        backgroundColor: '#ffffff',
                        overflowY: 'auto',
                    }}
                >
                    <Container maxWidth="sm">
                        <Box sx={{ mt: 3, p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#fff' }}>
                            <Typography variant="h5" gutterBottom textAlign="center">
                                Edit Data User
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="badge"
                                        label="Badge"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.badge}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        label="Nama"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.name}
                                        />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.email}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="supervisor_name"
                                        label="Supervisor Name"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.supervisor_name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="supervisor_email"
                                        label="Supervisor Email"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.supervisor_email}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="departement"
                                        label="Departement"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.departement}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="area"
                                        label="Area"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.area}
                                    />
                                </Grid>
                                {error && <Alert severity='error'>{error}</Alert>}
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        onClick={handleEdit}
                                        variant="contained"
                                        color="primary"
                                        sx={{ py: 1.5 }}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                </ModalContent>
            </StyledModal>

        </>
    );
}

export default ItemRequest;
