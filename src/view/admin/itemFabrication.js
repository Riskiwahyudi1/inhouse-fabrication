import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableContainer, Alert, Select, Pagination, TableHead, TableRow, Paper, TableCell, Box, InputBase, MenuItem, Button, Modal, Grid, Container, Typography, TextField, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search';
import Toast from '../../utils/Toast';
import { useAuth } from '../../contexts/AuthContext'
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

const currentYear = new Date().getFullYear();

function ItemFabrication() {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const [totalWeek, setTotalWeek] = useState(null)
  const [week, setWeek] = useState(null);
  const [listFabrication, setListFabrication] = useState([]);
  const [rawMaterialList, setRawMaterialList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState('cnc-milling');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formDataEdit, setFormDataEdit] = useState({
    total_minute: '',
  })


  const { status } = useParams();
  const currentStatus = status;


  // data tahun dinamis
  const startYear = 2024;

  const years = [];
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y);
  }

  // data week dinamis
  const handleChangeWeek = (event, value) => {
    setWeek(value);
  };
  const handleChangeYear = (e) => {
    setSelectedYear(e.target.value);
  };
  const handleChangeMachine = (e) => {
    setSelectedMachine(e.target.value);
  };

  const handleOpenModalEdit = () => {
    setOpenModalEdit(true);
  };

  const handleCloseModalEdit = () => {
    setOpenModalEdit(false);
  };

  // edit data proccess
  const formDataEditChange = (e) => {
    setFormDataEdit({
      ...formDataEdit,
      [e.target.name]: e.target.value
    });
  }
  // data week
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await api.get(`/api/admin/dashboard/show-week`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });
        const latestWeek = response.data[0].week;
        setTotalWeek(latestWeek);
        setWeek(latestWeek);
      } catch (error) {

        setError('gagal memuat data request..')
      }
    }
    fetchRequest()
  }, [])

  // data request
  useEffect(() => {
    if (week !== null) {
      const fetchRequest = async () => {
        try {
          const data = await api.get('/api/admin/fabrication-item', {
            params: { status: currentStatus, week: week, year: selectedYear, machineType: selectedMachine, search: searchKeyword},
            headers: {
              'Authorization': `Bearer ${adminToken}`,
            }
          });
          setListFabrication(data);
        } catch (error) {
          setError('gagal memuat data request..')
        }
      };
      fetchRequest();
    }
  }, [currentStatus, week, selectedYear, selectedMachine, searchKeyword]);

  // fabrikasi selesai
  const handleFinishFabrication = async (id) => {
    const result = await Dialog.fire({
      title: 'Anda yakin?',
      text: 'Pastikan fabrikasi sudah selesai!',
    });
    const data = {
      _id: id,
    }
    if (result.isConfirmed) {
      setLoading(true)
      try {
        const response = await api.put(`/api/admin/fabrication-item/finish`, data,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            }
          }
        );
        if (response.status === 200) {
          setLoading(false)
          Toast.fire({
            icon: 'success',
            title: 'Fabrikasi Selesai!',
          });
          navigate('../item-fabrication/finish', { state: { showToast: true } });
        }
      } catch (error) {
        Toast.fire({
          icon: 'error',
          title: 'Gagal update status!',
        });
        setLoading(false)
      }
    }
  };

  const handleEditWeek = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // validasi form
    if (

      !formDataEdit.total_minute
    ) {
      setError('Semua input wajib diisi!');
      setLoading(false);
      return;
    }
    try {
      const data = formDataEdit;
      const response = await api.put(`/api/admin/dashboard/edit-week`, data,
        {
          params: { week: week, year: selectedYear },
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
  // handel
  const handleOpenModal = (req) => {
    setSelectedRequest(req)
    // setIsLoading(true);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };


  return (
    <>
      <Helmet>
        <title>Fabrication Item | IF</title>
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
      <Box display="flex" gap={4}>
        {/* Select Year */}
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
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Choose Years
          </Typography>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            onChange={handleChangeYear}
            sx={{ height: 32, mt: 1, minWidth: 120 }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 150,
                  overflow: 'auto',
                },
              },
            }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Select Week */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Choose Weeks
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <Pagination
              count={totalWeek}
              variant="outlined"
              shape="rounded"
              page={week}
              onChange={handleChangeWeek}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleOpenModalEdit}
              sx={{ ml: 2 }}
            >
              Edit Week
            </Button>
          </Box>
        </Box>
      </Box >

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700, }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>REQUESTOR</StyledTableCell>
              <StyledTableCell>PART NAME</StyledTableCell>
              <StyledTableCell>EXTERNAL COST($USD)</StyledTableCell>
              <StyledTableCell>HOUR/PCS</StyledTableCell>
              <StyledTableCell>QUANTITY</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell align="center">ACTION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listFabrication?.data?.length > 0 ? (
              listFabrication.data.map((req, idx) => (
                <StyledTableRow key={req._id}>
                  <StyledTableCell>{idx + 1}</StyledTableCell>
                  <StyledTableCell>{req?.id_request_item?.id_requestor?.name}</StyledTableCell>
                  <StyledTableCell>{req?.id_request_item?.part_name}</StyledTableCell>
                  <StyledTableCell>{req?.id_request_item?.external_cost}</StyledTableCell>
                  <StyledTableCell>{req?.id_request_item?.work_estimate}</StyledTableCell>
                  <StyledTableCell>{req.quantity}</StyledTableCell>
                  <StyledTableCell>
                    {req.status
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {currentStatus === 'inprogress' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleFinishFabrication(req._id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Finish'
                        )}
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      sx={{ marginLeft: 1 }}
                    // onClick={() => handleRepeatOrder(req._id)}
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
      {
        selectedRequest && (
          <StyledModal open={openModal} onClose={handleCloseModal}>
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

                  {listFabrication?.data?.length > 0 ? (
                    listFabrication.data
                      .filter(req => req._id === selectedRequest)
                      .map(req => (
                        <Grid container spacing={2} key={req._id}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              name="requestQuantity"
                              label="Request Quantity"
                              variant="outlined"
                              readonly
                              value={req.quantity || ""}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              name="workEstimate"
                              label="Work Estimate"
                              variant="outlined"
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              name="fabricationCount"
                              label="Fabrication Count"
                              variant="outlined"
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              select
                              name="rawMaterial"
                              label="Raw Material Type"
                              variant="outlined"
                            >
                              {req?.machine_type === '3D Printing' ? (
                                rawMaterialList
                                  .filter(list => list.machine_type === '3D Printing')
                                  .map((list, idx) => (
                                    <MenuItem key={idx} value={list.price}>
                                      {list.raw_material_name}
                                    </MenuItem>
                                  ))
                              ) : (
                                rawMaterialList
                                  .filter(list => list.machine_type === 'CNC Milling')
                                  .map((list, idx) => (
                                    <MenuItem key={idx} value={list.price}>
                                      {list.raw_material_name}
                                    </MenuItem>
                                  ))
                              )}
                            </TextField>
                          </Grid>
                          {req.machine_type === '3D Printing' && (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                name="weight"
                                label="Weight"
                                variant="outlined"
                                required
                              />
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Button
                              fullWidth
                              type="submit"
                              variant="contained"
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
        )
      }
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
                Edit Data Week
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="week"
                    label="week"
                    variant="outlined"
                    onChange={formDataEditChange}
                    required
                    aria-readonly
                    value={week}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="total_minute"
                    label="minute"
                    variant="outlined"
                    onChange={formDataEditChange}
                    required
                    value={formDataEdit.total_minute}
                  />
                </Grid>
                {error && <Alert severity='error'>{error}</Alert>}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    onClick={handleEditWeek}
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

export default ItemFabrication;
