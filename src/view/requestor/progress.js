import React, { useEffect, useState } from 'react';
import {
  PieChart,
  pieArcLabelClasses,
  Gauge,
} from '@mui/x-charts';
import { Helmet } from "react-helmet-async";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TableBody,
  Pagination,
  Select,
  MenuItem,
  Stack,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Modal,
  Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext'
import Toast from '../../utils/Toast';
import api from './../../api'

// Custom TableCell styling
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: '#B0BEC5',
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  '&.MuiTableCell-body': {
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


const Home = () => {
  const size = { width: 600, height: 300 };

  const colors = {
    done: '#2e7d32',        // Green
    inProgress: '#ed6c02',  // Orange
    plan: '#0288d1',        // Blue
  };


  const { machineType, year } = useParams();

  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const [totalWeek, setTotalWeek] = useState(null)
  const [week, setWeek] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMachine, setSelectedMachine] = useState('cnc-milling');
  const [progressData, setProgressData] = useState([])
  const [machineUtilization, setMachineUtilization] = useState([])
  const [topItemFabrication, setTopItemFab] = useState([])
  const [submitSuccess, setSubmitSuccess] = useState(false);

  console.log(loading)
  // data week dinamis
  const handleChangeWeek = (event, value) => {
    setWeek(value);
  };


  // data tahun dinamis
  const currentYear = new Date().getFullYear();
  const startYear = 2024;

  const years = [];
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y);
  }

  const handleChangeYear = (e) => {
    navigate(`/progress/${machineType}/${e.target.value}`)
    setSelectedYear(e.target.value);
  };
  const handleChangeMachine = (e) => {
    navigate(`/progress/${e.target.value}/${selectedYear}`)
    setSelectedMachine(e.target.value);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/admin/dashboard/progress-data/${machineType}/${year}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });

        if (isMounted) {
          setProgressData(response.data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError('Gagal memuat data request...');
          setLoading(false);
        }
      }
    };

    fetchRequest();


    return () => {
      isMounted = false;
    };
  }, [machineType, year,]);


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

  // data utilization mesin
  useEffect(() => {
    const fetchRequest = async () => {

      try {
        const response = await api.get(`/api/admin/dashboard/machine-utilization/${machineType}`, {
          params: { week: week, year: year },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });
        setMachineUtilization(response.data)
      } catch (error) {
        console.error('gagal memuat data request')
      }
    }
    fetchRequest()
  }, [machineType, year, week, submitSuccess])

  // data top item fabrication
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await api.get(`/api/admin/dashboard/top-item-fabrication/${machineType}`, {
          params: { year: year },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          }
        });
        setTopItemFab(response.data)
      } catch (error) {
        setError('gagal memuat data request..')
      }
    }
    fetchRequest()
  }, [machineType, year, week])

  const progressValue = progressData.inProgress;
  const doneValue = progressData.finish;
  const totalPlan = progressValue + doneValue;

  const persenDone = ((doneValue / totalPlan) * 100).toFixed(2);
  const persenInProgress = (100 - persenDone).toFixed(2);

  // Data
  const data = [
    { id: 0, value: persenDone ?? 0, label: 'Done' },
    { id: 1, value: persenInProgress ?? 0, label: 'In Progress' },
  ];

  return (
    <>
      <Helmet>
        <title>Progress {year} | IF</title>
      </Helmet>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 2,
          backgroundColor: '#F5F5F5',
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: '#1B2D3F', fontWeight: 'bold', textAlign: 'center' }}
        >
          Progress Data/Year {machineType.replace(/-/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: '#1B2D3F', fontWeight: 'bold', textAlign: 'center' }}
        >
          {loading === true ? 'sedang loading' : ''}
        </Typography>

      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'row',

        mt: 2,
        backgroundColor: '#F5F5F5',
      }}>
        <Grid direction='row' sx={{ mt: 1, ml: 5 }}>
          <Typography variant='h6' fontWeight={'bold'}>Select Machine</Typography>
          <Select
            labelId="year-select-label"
            value={selectedMachine}
            onChange={handleChangeMachine}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
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

        </Grid>
        <Grid direction='row' sx={{ mt: 1, ml: 5 }}>
          <Typography variant='h6' fontWeight={'bold'}>Select Years</Typography>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            onChange={handleChangeYear}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250,
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

        </Grid>
      </Box>

      {/* Section: PieChart + Gauges */}
      <Box sx={{ pt: 1 }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="center"
        >
          {/* Pie Chart */}
          <Grid item>
            <PieChart
              series={[
                {
                  data: data,
                  arcLabel: (item) => `${item.value ?? 0} %`,
                  arcLabelMinAngle: 35,
                  arcLabelRadius: '60%',
                },
              ]}
              colors={[colors.done, colors.inProgress]}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fontWeight: 'bold',
                },
              }}
              {...size}
            />
          </Grid>

          {/* Gauges Section */}
          <Grid item>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems="center"
            >
              <Grid item>
                <Gauge
                  width={200}
                  height={200}
                  value={totalPlan}
                  valueMax={totalPlan}
                  sx={{ '& .MuiGauge-value': { fill: colors.plan } }}
                />
                <Typography align="center">Plan Total</Typography>
              </Grid>
              <Grid item>
                <Gauge
                  width={200}
                  height={200}
                  value={progressValue}
                  valueMax={totalPlan}
                  sx={{ '& .MuiGauge-value': { fill: colors.inProgress } }}
                />
                <Typography align="center">In Progress</Typography>
              </Grid>
              <Grid item>
                <Gauge
                  width={200}
                  height={200}
                  value={doneValue}
                  valueMax={totalPlan}
                  sx={{ '& .MuiGauge-value': { fill: colors.done } }}
                />
                <Typography align="center">Done</Typography>
              </Grid>
            </Grid>

            {/* Divider and Saving Info */}
            <Divider sx={{ borderColor: 'grey.800', my: 4 }} />

            <Grid container direction="column" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Potential Saving = ${progressData.estimasiSaving}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Aktual Saving = ${progressData.aktualSaving}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: 'grey.800', my: 4 }} />

      {/* Section: Weekly Utilization */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 2,
          backgroundColor: '#F5F5F5',
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: '#1B2D3F', fontWeight: 'bold', textAlign: 'center' }}
        >
          Weekly Data
        </Typography>
      </Box>
      <Grid direction='row' sx={{ mt: 1, ml: 5 }}>
        <Typography variant="h6" fontWeight="bold">
          Select Weeks
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="start" mt={2}>
          <Pagination
            count={totalWeek}
            variant="outlined"
            shape="rounded"
            page={week}
            onChange={handleChangeWeek}
          />
          {/* <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleOpenModalEdit}
            sx={{ ml: 2 }}
          // onClick={() => handleRepeatOrder(req._id)}
          >
            Edit Week
          </Button> */}
        </Box>
      </Grid>

      <Box sx={{ pt: 4 }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Gauge Kiri */}
          <Grid item sx={{ ml: 10, mr: 5 }}>
            <Gauge
              width={200}
              height={200}
              value={machineUtilization.utilizationPercentage}
              sx={{ '& .MuiGauge-value': { fill: colors.inProgress } }}
            />
            <Typography align="center">Total Utilization(%)</Typography>
          </Grid>

          {/* Table Kanan */}
          <Grid item xs sx={{ px: 3 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="weekly utilization table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>NO</StyledTableCell>
                    <StyledTableCell>REQUESTOR</StyledTableCell>
                    <StyledTableCell>PART NAME</StyledTableCell>
                    <StyledTableCell>QUANTITY</StyledTableCell>
                    <StyledTableCell>SAVING COST</StyledTableCell>
                    <StyledTableCell>PROCESSING TIME</StyledTableCell>
                    <StyledTableCell>STATUS</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machineUtilization?.filterMachineUtilization?.length > 0 ? (
                    machineUtilization?.filterMachineUtilization?.map((item, idx) => (
                      <StyledTableRow key={item._id}>
                        {console.log(machineUtilization)}
                        <StyledTableCell>{idx + 1}</StyledTableCell>
                        <StyledTableCell>{item?.id_request_item?.id_requestor?.name || "-"}</StyledTableCell>
                        <StyledTableCell>{item?.id_request_item?.part_name || "-"}</StyledTableCell>
                        <StyledTableCell>{item?.quantity || "-"}</StyledTableCell>
                        <StyledTableCell>${item?.saving_cost || "-"}</StyledTableCell>
                        <StyledTableCell>{item.utilization || "-"} Jam</StyledTableCell>
                        <StyledTableCell>{item?.status || "-"}</StyledTableCell>

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
          </Grid>
        </Grid>
      </Box>
      {/* Divider */}
      <Divider sx={{ borderColor: 'grey.800', my: 4 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 2,
          backgroundColor: '#F5F5F5',
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: '#1B2D3F', fontWeight: 'bold', textAlign: 'center' }}
        >
          Top Inhouse Fabrication Product
        </Typography>
      </Box>
      <Box sx={{ pt: 6, px: 3 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700, }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>NO</StyledTableCell>
                <StyledTableCell>REQUESTOR</StyledTableCell>
                <StyledTableCell>PART NAME</StyledTableCell>
                <StyledTableCell>TOTAL FABRICATION</StyledTableCell>
                <StyledTableCell>TYPE REQUEST</StyledTableCell>
                <StyledTableCell>FAB TIME/PCS</StyledTableCell>
                <StyledTableCell>EXTERNAL COST/PCS</StyledTableCell>
                <StyledTableCell>TOTAL SAVING</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topItemFabrication?.length > 0 ? (
                topItemFabrication.map((item, idx) => (
                  <StyledTableRow key={item._id}>
                    <StyledTableCell>{idx + 1}</StyledTableCell>
                    <StyledTableCell>{item?.requestor_name || '-'}</StyledTableCell>
                    <StyledTableCell>{item?.part_name}</StyledTableCell>
                    <StyledTableCell>{item?.totalQuantity} Pcs</StyledTableCell>
                    <StyledTableCell>{item?.type_request || '-'}</StyledTableCell>
                    <StyledTableCell>{item?.work_estimate}</StyledTableCell>
                    <StyledTableCell>${item?.external_cost || '-'}</StyledTableCell>
                    <StyledTableCell>${item?.total_saving.toFixed(2) || '-'}</StyledTableCell>
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

    </>
  );
};

export default Home;
