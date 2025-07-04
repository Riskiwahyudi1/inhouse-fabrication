import React, { useState } from 'react';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

function NavbarRequestor() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Register', action: () => navigate('./register') },
    { text: 'Progress Request', action: () => navigate(`./progress/cnc-milling/${currentYear}`) },
    { text: 'New Order', action: () => navigate('./form-request') },
    { text: 'Repeat Order', action: () => navigate('./item-request') },
    { text: 'Login Admin', action: () => navigate('./admin/login') },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#00A63F' }}>
        <Toolbar>
          {/* Menu icon for small screens */}
          <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
          {/* Logo / Title */}
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, color: '#fff', cursor: 'pointer', ml:2, fontWeight: 'bold' }}
            onClick={() => navigate('./')}
          >
            PT Excelitas Technologies Batam
          </Typography>

          {/* Buttons for medium and up screens */}
          <Box sx={{ display: { xs: 'none', md: 'none' } }}>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                onClick={item.action}
                variant="contained"
                sx={{
                  backgroundColor: '#fff',
                  mx: 1,
                  color: '#000',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer menu for mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250, backgroundColor: '#00A63F', height: '100%' }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={item.action}>
                  <ListItemText
                    primary={item.text}
                    sx={{ color: 'white', fontWeight: 'bold' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

    </Box>
  );
}

export default NavbarRequestor;
