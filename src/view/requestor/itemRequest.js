import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableContainer, TableHead, TableRow, Paper, TableCell, Box, Alert, InputBase, MenuItem, Button, Modal, Grid, Container, Typography, TextField, CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { formatDate } from '../../utils/isoDate'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import Toast from '../../utils/Toast';
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
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const [listRequest, setlistRequest] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    badge: '',
    quantity: ''
  })

  const formDataChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await api.get('/api/request-item');
        setlistRequest(data)
      } catch (error) {
        setError('gagal memuat product..')
      }
    }
    fetchRequest()
  }, [submitSuccess])

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // validasi form
    if (
      !formData.quantity ||
      !formData.badge
    ) {
      setError('Semua Input wajib diisi!');
      setLoading(false);
      return;
    }
    try {
      const data = formData;
      const response = await api.post(`/api/request-item/repeat-order`, data
      );
      if (response.status === 201) {
        Toast.fire({
          icon: 'success',
          title: 'Berhasil melakukan repeat order.'
        })

      }
      setSubmitSuccess(!submitSuccess);
      handleCloseModal()
    } catch (error) {
      if (error.response.status === 400) {
        setError(
          error.response.data.errors[0].msg
        );
      } else if (error.response.status === 401) {
        setError(
          'Badge belum terdaftar!'
        );
      } else {
        setError('Gagal melakukan order.');
      }
    } finally {
      setLoading(false);
    }

  }

  // handel
  const handleOpenModal = (req) => {
    setSelectedRequest(req)

    // menembahkan id di form data
    setFormData(prevFormData => ({
      ...prevFormData,
      id_request_item: req
    }));

    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };


  return (
    <>
      <Helmet>
        <title>Item List | IF</title>
      </Helmet>
      <Box sx={{ mb: 2, mt: 4, maxWidth: 600 }}>
        <Search >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <InputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
      </Box>
      <Box sx={{ px: 3 }}>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700, px: 3 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>QUEUE</StyledTableCell>
                <StyledTableCell>REQUESTOR</StyledTableCell>
                <StyledTableCell>PART NAME</StyledTableCell>
                <StyledTableCell>TYPE REQUEST</StyledTableCell>
                <StyledTableCell>QUANTITY</StyledTableCell>
                <StyledTableCell>CRD</StyledTableCell>
                <StyledTableCell>ESTIMATION</StyledTableCell>
                <StyledTableCell>STATUS</StyledTableCell>
                <StyledTableCell align="center">ACTION</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listRequest?.data?.length > 0 ? (
                listRequest.data.map((req) => (
                  <StyledTableRow key={req._id}>
                    <StyledTableCell>{req._id}</StyledTableCell>
                    <StyledTableCell>{req.id_requestor?.name}</StyledTableCell>
                    <StyledTableCell>{req.part_name}</StyledTableCell>
                    <StyledTableCell>{req?.machine_type} - {req?.fabrication_type}</StyledTableCell>
                    <StyledTableCell>{req.quantity}</StyledTableCell>
                    <StyledTableCell>{formatDate(req.crd)}</StyledTableCell>
                    <StyledTableCell>{req.est || '-'}</StyledTableCell>
                    <StyledTableCell>
                      {req.status
                        .replace(/-/g, " ")
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        // onClick={() => handleDetail(req._id)}
                        sx={{ marginRight: 1 }}
                      >
                        Detail
                      </Button>
                      {req.status !== 'reject' && (

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenModal(req._id)}
                        >
                          Repeat Order
                        </Button>
                      )}
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
      </Box>

      <StyledModal open={openModal} onClose={handleCloseModal}>
        <ModalContent
          sx={{
            padding: 3,
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 700,
            maxHeight: "90vh",
            margin: "auto",
            backgroundColor: "#ffffff",
            overflowY: "auto",
          }}
        >
          <Container maxWidth="sm">
            <Box
              sx={{
                mt: 3,
                p: 3,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="h5" gutterBottom textAlign="center">
                Form Repeat Order
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="badge"
                    onChange={formDataChange}
                    label="Input Badge With B"
                    variant="outlined"
                    value={formData.badge}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="quantity"
                    onChange={formDataChange}
                    label="Input Quantity"
                    variant="outlined"
                    value={formData.quantity}
                    required
                    type="number"

                  />
                </Grid>
                {error && <Alert severity='error'>{error}</Alert>}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit}
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
