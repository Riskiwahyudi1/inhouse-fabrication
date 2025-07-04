import React from 'react'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';


function NavbarRequestor() {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate('./register');
    };
    const progressRequest = () => {
        navigate('./item-request');
    };
    const home = () => {
        navigate('./');
    };
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" component="div" onClick={home} sx={{ flexGrow: 1,  cursor:'pointer', }}>
                        Excelitas Technologies
                    </Typography>

                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default NavbarRequestor