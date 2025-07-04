import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableContainer, Select, TableHead, TableRow, Paper, TableCell, Box, Alert, InputBase, MenuItem, Button, Modal, Grid, Container, Typography, TextField, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios'
import { formatDate } from '../../utils/isoDate'
import { useAuth } from '../../contexts/AuthContext'
import Toast from '../../utils/Toast';
import Dialog from '../../utils/Dialog'
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
  const { status } = useParams();
  const currentStatus = status;
  const [listRequest, setlistRequest] = useState([]);
  const [rawMaterialList, setRawMaterialList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModalFabrikasi, setOpenModalFabrikasi] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('cnc-milling');
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');


  const [formDataFabrikasi, setFormDataFabrikasi] = useState({
    id_request_item: '',
    quantity: '',
    week: ''
  })
  const [formDataEdit, setFormDataEdit] = useState({
    id_request_item: '',
    part_name: '',
    external_cost: '',
    machine_type: '',
    fabrication_type: '',
    work_estimate: '',
    raw_material_name: '',
    weight: '',
  })
  useEffect(() => {
    if (listRequest?.data && selectedRequest) {
      const req = listRequest.data.find(item => item._id === selectedRequest);
      if (req) {
        setFormDataEdit(prev => ({
          ...prev,
          part_name: req.part_name || '',
          machine_type: req.machine_type || '',
          fabrication_type: req.fabrication_type || '',
          work_estimate: req.work_estimate || '',
          external_cost: req.external_cost || '',
          raw_material_name: req.raw_material_name || '',
          weight: req.weight || '',
        }));
      }
    }
  }, [listRequest, selectedRequest]);

  // input change
  const formDataEditChange = (e) => {
    setFormDataEdit({
      ...formDataEdit,
      [e.target.name]: e.target.value
    });
  }

  const handleChangeMachine = (e) => {
    setSelectedMachine(e.target.value);
  };

  const formDataFabrikasiChange = (e) => {
    setFormDataFabrikasi({
      ...formDataFabrikasi,
      [e.target.name]: e.target.value
    });
  }
  // handle submit fabrikasi
  const handleSubmitFabrikasi = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // validasi form
    if (
      !formDataFabrikasi.id_request_item ||
      !formDataFabrikasi.quantity
    ) {
      setError('Semua input wajib diisi!');
      setLoading(false);
      return;
    }
    try {
      const data = formDataFabrikasi;
      const response = await api.post(`/api/admin/fabrication-item/add`, data,
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
        navigate("../item-fabrication/inprogress");
      }
      handleCloseModalFabrikasi()
    } catch (error) {
      if (error.response.status === 400) {
        setError(
          error.response.data.errors[0].msg
        );
      } else if (error.response.status === 404) {
        setError(error.response.data.error)
      } else {
        setError('Gagal menambahkan data!');
      }
    } finally {
      setLoading(false);
    }

  }
  // handle Edit data
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // validasi form
    if (
      !formDataEdit.id_request_item ||
      !formDataEdit.external_cost ||
      !formDataEdit.work_estimate ||
      !formDataEdit.raw_material_name
    ) {
      setError('Semua input wajib diisi!');
      setLoading(false);
      return;
    }

    try {
      const data = formDataEdit;
      const response = await api.put(`/api/admin/request-item/edit`, data,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          }
        }
      );
      if (response.status === 200) {
        Toast.fire({
          icon: 'success',
          title: 'Data berhasil di edit.'
        })
      }
      setSubmitSuccess(!submitSuccess);
      handleCloseModalFabrikasi()
    } catch (error) {
      if (error.response.status === 400) {
        setError(
          error.response.data.errors[0].msg
        );
      } else {
        setError('Gagal menambahkan data!');
      }
    } finally {
      setLoading(false);
    }

  }
  // data request
  const paramsString = JSON.stringify(currentStatus);
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await api.get('/api/admin/request-item', {
          params: { status: currentStatus, machineType: selectedMachine, search: searchKeyword },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });
        setlistRequest(data)
      } catch (error) {
        setError('Gagal memuat data request...')
      }
    }
    fetchRequest()
  }, [paramsString, submitSuccess, selectedMachine, searchKeyword])

  // data raw material
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await api.get('/api/admin/raw-material', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });
        setRawMaterialList(response.data)
      } catch (error) {
        setError('Gagal memuat data raw material...')
      }
    }
    fetchRequest()
  }, [])

  // fabrikasi reject
  const handlerejectRequest = async (id) => {
    const result = await Dialog.fire({
      title: 'Anda yakin?',
      text: 'Ingin reject request ini?',
    });
    const data = {
      _id: id,
    }
    if (result.isConfirmed) {
      try {
        const response = await api.put(`/api/admin/request-item/reject`, data,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            }
          }
        );
        if (response.status === 200) {
          Toast.fire({
            icon: 'success',
            title: 'berhasil update status!',
          });
          navigate('../item-request/reject', { state: { showToast: true } });
        }
      } catch (error) {
        Toast.fire({
          icon: 'error',
          title: 'Gagal update status, silahkan coba lagi nanti!',
        });
      }
    }
  };

  // handel Fabrikasi
  const handleOpenModalFabrikasi = (req) => {
    setSelectedRequest(req)
    setFormDataFabrikasi(prevFormData => ({
      ...prevFormData,
      id_request_item: req
    }));
    setOpenModalFabrikasi(true);
  };
  const handleCloseModalFabrikasi = () => {
    setOpenModalFabrikasi(false);
    setSelectedRequest(null);
  };
  // handle edit data request
  const handleOpenModalEdit = (req) => {
    setSelectedRequest(req)
    setFormDataEdit(prevFormData => ({
      ...prevFormData,
      id_request_item: req
    }));
    setOpenModalEdit(true);
  };
  const handleCloseModalEdit = () => {
    setOpenModalEdit(false);
    setSelectedRequest(null);
  };

  return (
    <>
      <Helmet>
        <title> Request Item | IF</title>
      </Helmet>
      <Box sx={{ mb: 2, mt: 4, maxWidth: 600 }}>
        <Search >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <InputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Search>
      </Box>
      <Box>
        <Typography variant='h6' fontWeight={'bold'}>Select Machine</Typography>
        <Select
          labelId="year-select-label"
          value={selectedMachine}
          onChange={handleChangeMachine}
          sx={{ height: 32, mt: 2, minWidth: 120 }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 150,
                overflow: 'auto',
              },
            },
          }}
        >

          <MenuItem value='cnc-milling'>
            CNC Milling
          </MenuItem>
          <MenuItem value='3d-printing'>
            3D Printing
          </MenuItem>

        </Select>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700, }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>REQUESTOR</StyledTableCell>
              <StyledTableCell>PART NAME</StyledTableCell>
              <StyledTableCell>REQUEST TYPE</StyledTableCell>
              <StyledTableCell>QUANTITY</StyledTableCell>
              <StyledTableCell>CRD</StyledTableCell>
              <StyledTableCell align="center">ACTION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listRequest?.data?.length > 0 ? (
              listRequest.data
                .filter((req) => req.quantity > 0)
                .map((req, idx) => (
                  <StyledTableRow key={req._id}>
                    <StyledTableCell>{idx + 1}</StyledTableCell>
                    <StyledTableCell>{req.id_requestor?.name}</StyledTableCell>
                    <StyledTableCell>{req.part_name}</StyledTableCell>
                    <StyledTableCell>{req?.machine_type} - {req?.fabrication_type}</StyledTableCell>
                    <StyledTableCell>{req.quantity}</StyledTableCell>
                    <StyledTableCell>{formatDate(req.crd)}</StyledTableCell>
                    <StyledTableCell align="center">
                      {['new', 'repeat-order'].includes(currentStatus) && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={req?.work_estimate === null && req?.external_cost === null}
                            onClick={() => handleOpenModalFabrikasi(req._id)}
                          >
                            Fabrication
                          </Button>
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              sx={{ marginLeft: 1 }}
                              onClick={() => handleOpenModalEdit(req._id)}
                            >
                              {req.external_cost === null ? 'Approve' : 'edit'}
                            </Button>
                            {req?.work_estimate === null && req?.external_cost === null && (
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  bgcolor: 'red',
                                  borderRadius: '50%',
                                  position: 'absolute',
                                  top: -6,
                                  right: -6,
                                  border: '2px solid white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                  !
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </>
                      )}
                      {currentStatus === 'new' && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={req?.work_estimate !== null && req?.external_cost !== null}
                          sx={{ marginLeft: 1 }}
                          onClick={() => handlerejectRequest(req._id)}
                        >
                          Reject
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        sx={{ marginLeft: 1 }}

                      >
                        Detail
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
            ) : (
              <StyledTableRow>
                {error ? (
                  <StyledTableCell colSpan={9} align="center">
                    {error}
                  </StyledTableCell>
                ) : (
                  <StyledTableCell colSpan={9} align="center">
                    Tidak ada data yang tersedia.
                  </StyledTableCell>
                )}
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedRequest && (
        <StyledModal open={openModalFabrikasi} onClose={handleCloseModalFabrikasi}>
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
                  Item Data
                </Typography>

                {listRequest?.data?.length > 0 ? (
                  listRequest.data
                    .filter(req => req._id === selectedRequest)
                    .map(req => (
                      <Grid container spacing={2} key={req._id}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Request Quantity"
                            variant="outlined"
                            value={req.quantity}
                            InputProps={{ readOnly: true }}

                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="quantity"
                            onChange={formDataFabrikasiChange}
                            label="Fabrication Quantity"
                            variant="outlined"
                            value={formDataFabrikasi.quantity}
                            required
                            type="number"
                            InputProps={{ inputProps: { min: 1, max: req.quantity } }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="week"
                            onChange={formDataFabrikasiChange}
                            label="Week Fabrikasi"
                            variant="outlined"
                            value={formDataFabrikasi.week}
                            required
                            type="number"
                            InputProps={{ inputProps: { min: 1, max: req.week } }}
                          />
                        </Grid>
                        {error && <Alert severity='error'>{error}</Alert>}
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            onClick={handleSubmitFabrikasi}
                            color="primary"
                            sx={{ py: 1.5 }}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                          </Button>
                        </Grid>
                      </Grid>
                    ))
                ) : (
                  <Typography textAlign="center" color="textSecondary">
                    Tidak ada data yang tersedia
                  </Typography>
                )}
              </Box>
            </Container>
          </ModalContent>
        </StyledModal>
      )}
      {selectedRequest && (
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
                  Edit Data Item Request
                </Typography>

                {listRequest?.data?.length > 0 ? (
                  listRequest.data
                    .filter(req => req._id === selectedRequest)
                    .map(req => (
                      <Grid container spacing={2} key={req._id}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="part_name"
                            label="Part Name"
                            onChange={formDataEditChange}
                            variant="outlined"
                            value={formDataEdit.part_name}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Request Quantity"
                            variant="outlined"
                            value={req.quantity}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Select Machine Type"
                            variant="outlined"
                            name='machine_type'
                            value={formDataEdit.machine_type}
                            onChange={formDataEditChange}
                            fullWidth
                            select >
                            <MenuItem value="3d-printing">3D Printing</MenuItem>
                            <MenuItem value="cnc-milling">CNC Milling</MenuItem>
                            <MenuItem value="Cleaning Jig">Cleaning Jig</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Select Fabrication Type"
                            variant="outlined"
                            name='fabrication_type'
                            value={formDataEdit.fabrication_type}
                            onChange={formDataEditChange}
                            fullWidth
                            select >
                            <MenuItem value="Prototype">Prototype</MenuItem>
                            <MenuItem value="Production Use">Production Use</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="external_cost"
                            label="External Cost($USD)"
                            onChange={formDataEditChange}
                            variant="outlined"
                            type='Number'
                            value={formDataEdit.external_cost}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="work_estimate"
                            label="Work Estimate"
                            onChange={formDataEditChange}
                            variant="outlined"
                            value={formDataEdit.work_estimate}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            select
                            name="raw_material_name"
                            label="Raw Material Type"
                            onChange={formDataEditChange}
                            variant="outlined"
                            value={formDataEdit.raw_material_name}
                          >
                            {formDataEdit.machine_type === '3d-printing' ? (
                              rawMaterialList
                                .filter(list => list.machine_type === '3d-printing')
                                .map((list, idx) => (
                                  <MenuItem key={idx} value={list._id}>
                                    {list.raw_material_name}
                                  </MenuItem>
                                ))
                            ) : (
                              rawMaterialList
                                .filter(list => list.machine_type === 'cnc-milling')
                                .map((list, idx) => (
                                  <MenuItem key={idx} value={list._id}>
                                    {list.raw_material_name}
                                  </MenuItem>
                                ))
                            )}
                          </TextField>
                        </Grid>
                        {formDataEdit.machine_type === '3d-printing' && (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              name="weight"
                              label="Weight"
                              onChange={formDataEditChange}
                              variant="outlined"
                              value={formDataEdit.weight}
                              required
                            />
                          </Grid>
                        )}
                        {error && <Alert severity='error'>{error}</Alert>}
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            onClick={handleSubmitEdit}
                            color="primary"
                            sx={{ py: 1.5 }}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                          </Button>
                        </Grid>
                      </Grid>
                    ))
                ) : (
                  <StyledTableRow>
                    {error ? (
                      <StyledTableCell colSpan={9} align="center">
                        {error}
                      </StyledTableCell>
                    ) : (
                      <StyledTableCell colSpan={9} align="center">
                        Tidak ada data yang tersedia.
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                )}
              </Box>
            </Container>
          </ModalContent>
        </StyledModal>
      )}

    </>
  );
}

export default ItemRequest;
