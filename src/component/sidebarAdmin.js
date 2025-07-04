import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Tooltip from '@mui/material/Tooltip';
import SegmentIcon from '@mui/icons-material/Segment';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const drawerWidth = 240;

// Add these styled components
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const openedMixin = (theme) => ({
    width: drawerWidth,
    background: '#00A63F',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    // opacity:0
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    background: '#00A63F',
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    background: '#00A63F',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function MiniDrawer() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [menuStates, setMenuStates] = React.useState({});
    const { logoutAdmin } = useAuth();

    const location = useLocation();


    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleSubmenuClick = (menuId) => {
        setMenuStates((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    const menuItems = [

        {
            text: 'Request Item',
            icon: < ListAltIcon />,
            submenu: [
                {
                    text: 'New Request',
                    icon: <FiberNewIcon />,
                    path: '/admin/item-request/new'
                },

                {
                    text: 'Repeat Order',
                    icon: <RepeatIcon />,
                    path: '/admin/repeat-order'
                },

                {
                    text: 'Reject',
                    icon: <CancelIcon />,
                    path: '/admin/item-request/reject'
                }
            ]
        },
        {
            text: 'Progres Status',
            icon: < EngineeringIcon />,
            submenu: [

                {
                    text: 'In Progress',
                    icon: <HourglassBottomIcon />,
                    path: '/admin/item-fabrication/inprogress'
                },
                {
                    text: 'Done',
                    icon: <CheckCircleIcon />,
                    path: '/admin/item-fabrication/finish'
                }
            ]
        },
        {
            text: 'Raw Material',
            icon: <SegmentIcon />,
            path: '/admin/raw-material'
        },
        {
            text: 'Machine List',
            icon: <PrecisionManufacturingIcon />,
            path: '/admin/machine-list'
        },
        {
            text: 'Requestor List',
            icon: <PeopleIcon />,
            path: '/admin/requestor-list'
        },
    ];

    const LogoContainer = styled('div')({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    });

    // Styled component untuk logo image
    const LogoImage = styled('img')({
        height: '50px',
        width: 'auto',
        objectFit: 'contain',
    });


    return (
        <Box sx={{ display: 'flex' }}
        >
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant='h5'
                        sx={{
                            cursor: 'pointer',
                            marginRight: 'auto',
                            fontWeight: 'bold',
                        }}
                    >
                        Excelitas Technologies Batam
                    </Typography>

                    <Avatar
                        onClick={handleOpenMenu}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: '#ffff',
                            marginLeft: 'auto',
                            color: '#54cbbb',
                            fontWeight: 'bold',
                        }}
                    >
                        U
                    </Avatar>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem onClick={() => {
                            logoutAdmin();
                            handleCloseMenu();
                        }}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <Typography variant="h6" noWrap sx={{ color: '#ffffff', marginLeft: '25px' }}>
                        Hi, Admin
                    </Typography>
                    <IconButton onClick={handleDrawerClose} sx={{ color: '#ffffff' }}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.text}>
                            <Tooltip title={item.text} placement="right" disableHoverListener={open}>
                                <ListItem disablePadding sx={{ display: 'block' }}>
                                    <ListItemButton
                                        onClick={() => item.submenu ? handleSubmenuClick(item.text) : null}
                                        component={item.submenu ? 'div' : Link}
                                        to={item.submenu ? undefined : item.path}
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: open ? 'initial' : 'center',
                                            px: open ? 2.5 : 1,
                                            backgroundColor: location.pathname === item.path ? '#ffffff33' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: '#ffffff44',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 3 : 'auto',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            sx={{
                                                opacity: open ? 1 : 0,
                                                width: open ? 'auto' : 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: '#ffffff',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />
                                        {item.submenu && open && (
                                            menuStates[item.text] ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>

                            {/* Submenu */}
                            {item.submenu && (
                                <Collapse in={open && menuStates[item.text]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.submenu.map((subItem) => (
                                            <ListItemButton
                                                key={subItem.text}
                                                component={Link}
                                                to={subItem.path}
                                                sx={{
                                                    pl: 4,
                                                    backgroundColor: location.pathname === subItem.path ? '#ffffff33' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: '#ffffff44',
                                                    },
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: '#ffffff' }}>
                                                    {subItem.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.text}
                                                    sx={{
                                                        color: '#ffffff',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    ))}
                </List>

                <Divider />
            </Drawer>
        </Box>
    );
}