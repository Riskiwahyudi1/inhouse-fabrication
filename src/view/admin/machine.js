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
    const [listData, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formData, setFormData] = useState({
        machine_name: '',
        machine_type: '',
        machine_power: '',
    })
    const [formDataEdit, setFormDataEdit] = useState({
        machine_name: '',
        machine_type: '',
        machine_power: '',
    })

    // set  form data edit
    useEffect(() => {
        if (listData && selectedRequest) {
            const req = listData.find(item => item._id === selectedRequest);
            if (req) {
                setFormDataEdit(prev => ({
                    ...prev,
                    machine_name: req.machine_name || '',
                    machine_type: req.machine_type || '',
                    machine_power: req.machine_power || '',
                }));
            }
        }
    }, [listData, selectedRequest]);

    // add data proccess
    const formDataChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    // edit data proccess
    const formDataEditChange = (e) => {
        setFormDataEdit({
            ...formDataEdit,
            [e.target.name]: e.target.value
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // validasi form
        if (
            !formData.machine_name ||
            !formData.machine_type ||
            !formData.machine_power
        ) {
            setError('Semua input wajib diisi!');
            setLoading(false);
            return;
        }
        try {
            const data = formData;
            const response = await api.post(`/api/admin/machine/add`, data,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    }
                }
            );
            if (response.status === 201) {
                Toast.fire({
                    icon: 'success',
                    title: 'Data berhasil ditambahkan.'
                })
            }
            setData(prevData => [...prevData, response.data])
            handleCloseModalAdd()
        } catch (error) {
            if (error.response.status === 400) {
                setError(
                    error.response.data.errors[0].msg
                );
            } else {
                setError('Gagal menambahkan data.');
            }
        } finally {
            setLoading(false);
        }

    }
    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // validasi form
        if (
            !formDataEdit.machine_name ||
            !formDataEdit.machine_type ||
            !formDataEdit.machine_power
        ) {
            setError('Semua input wajib diisi!');
            setLoading(false);
            return;
        }
        try {
            const data = formDataEdit;
            const response = await api.put(`/api/admin/machine/edit`, data,
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

    // get data proccess
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get('/api/admin/machine-list', {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                    }
                });
                setData(response.data)
            } catch (error) {
                setError('gagal memuat data..')
            }
        }
        fetchRequest()
    }, [submitSuccess])



    // modal handle
    const handleOpenModalAdd = () => {
        setOpenModalAdd(true);
    };

    const handleCloseModalAdd = () => {
        setOpenModalAdd(false);

    };

    const handleOpenModalEdit = (id) => {
        setSelectedRequest(id)
        setFormDataEdit({ ...formDataEdit, id_machine: id })
        setOpenModalEdit(true);
    };

    const handleCloseModalEdit = () => {
        setOpenModalEdit(false);
        setSelectedRequest(null);
    };
    return (
        <>
            <Helmet>
                <title>Machine List | IF</title>
            </Helmet>
            <Box sx={{ mb: 2, mt: 4, maxWidth: 400, display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#00A63F",
                        "&:hover": { backgroundColor: "#008C36" },
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                    }}
                    padding='10px'
                    startIcon={<AddCircleIcon />} // Icon tambah
                    onClick={handleOpenModalAdd}
                >
                    Tambah
                </Button>

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
            <TableContainer component={Paper} sx={{ width: '50vw' }}>
                <Table sx={{ MaxWidth: 500, }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>No</StyledTableCell>
                            <StyledTableCell>Machine Name</StyledTableCell>
                            <StyledTableCell>Machine Type</StyledTableCell>
                            <StyledTableCell>Machine Power</StyledTableCell>
                            <StyledTableCell align="center">ACTION</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listData?.length > 0 ? (
                            listData.map((data, idx) => (
                                <StyledTableRow key={idx}>
                                    <StyledTableCell>{idx + 1}</StyledTableCell>
                                    <StyledTableCell>{data.machine_name}</StyledTableCell>
                                    <StyledTableCell>{data.machine_type}</StyledTableCell>
                                    <StyledTableCell>{data.machine_power} Kwh</StyledTableCell>
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
                                    Tidak ada data yang tersedia..
                                </StyledTableCell>
                            </StyledTableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <StyledModal open={openModalAdd} onClose={handleCloseModalAdd}>
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
                                Tambah Data Machine
                            </Typography>


                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_name"
                                        label="Machine Name"
                                        variant="outlined"
                                        onChange={formDataChange}
                                        required
                                        value={formData.machine_name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_type"
                                        label="Machine Type"
                                        variant="outlined"
                                        onChange={formDataChange}
                                        required
                                        value={formData.machine_type}
                                        select >
                                        <MenuItem value="3d-printing">3D Printing</MenuItem>
                                        <MenuItem value="cnc-milling">CNC Milling</MenuItem>
                                        <MenuItem value="cleaning-jig">Cleaning Jig</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_power"
                                        label="Machine Power"
                                        variant="outlined"
                                        onChange={formDataChange}
                                        required
                                        value={formData.machine_power}
                                    />
                                </Grid>
                                {error && <Alert severity='error'>{error}</Alert>}
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        onClick={handleSubmit}
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
                                Edit Data Machine
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_name"
                                        label="RMachine Name"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.machine_name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_type"
                                        label="Machine Type"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.machine_type}
                                        select >
                                        <MenuItem value="3d-printing">3D Printing</MenuItem>
                                        <MenuItem value="cnc-milling">CNC Milling</MenuItem>
                                        <MenuItem value="cleaning-jig">Cleaning Jig</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="machine_power"
                                        label="Machine Power"
                                        variant="outlined"
                                        onChange={formDataEditChange}
                                        required
                                        value={formDataEdit.machine_power}
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
