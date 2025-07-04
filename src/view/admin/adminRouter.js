import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material';
// import Home from '../requestor/home'
import SideBarAdmin from './../../component/sidebarAdmin'
import ItemRequest from './itemRequest'
import RawMaterial from './rawMaterial'
import Machine from './machine'
import ItemFabrication from './itemFabrication'
import RequestorList from './requestorList'
import RepeatOrderList from './repeatOrder'

const AdminRouter = () => {
  
  return (
    <Box sx={{ display: 'flex' }}>
      <SideBarAdmin />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#fffff',
          minHeight: '90vh',
          mt: 6,
        }}
      >

        <Routes>
          {/* <Route path="/home/:machineType/:year" element={<Home />} /> */}
          <Route path="/item-request/:status" element={<ItemRequest />} />
          <Route path="/raw-material" element={<RawMaterial />} />
          <Route path="/machine-list" element={<Machine />} />
          <Route path="/item-fabrication/:status" element={<ItemFabrication />} />
          <Route path="/requestor-list" element={<RequestorList />} />
          <Route path="/repeat-order" element={<RepeatOrderList />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default AdminRouter