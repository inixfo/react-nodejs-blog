import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  alpha,
  Badge
} from '@mui/material';
import { 
  AccountCircle, 
  Search as SearchIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, mt: 2 }}>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar src={user?.avatar}>{user?.name?.[0]}</Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={user?.name} 
            secondary={user?.email}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItemButton onClick={() => navigate('/')}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        {user && (
          <>
            <ListItemButton onClick={() => navigate('/profile')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/create')}>
              <ListItemIcon><CreateIcon /></ListItemIcon>
              <ListItemText primary="Create Post" />
            </ListItemButton>
            {user.role === 'admin' && (
              <ListItemButton onClick={() => navigate('/admin')}>
                <ListItemIcon><AdminIcon /></ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItemButton>
            )}
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        )}
        {!user && (
          <>
            <ListItemButton onClick={() => navigate('/login')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/register')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              mr: 4,
              display: { xs: 'none', sm: 'block' },
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent'
            }}
          >
            Blog
          </Typography>

          <Box sx={{ flexGrow: 1, maxWidth: 600, mx: { xs: 1, sm: 4 } }}>
            <SearchBar />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/profile"
                    startIcon={<PersonIcon />}
                    sx={{ color: 'text.primary' }}
                  >
                    Profile
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/create"
                    startIcon={<CreateIcon />}
                    sx={{ color: 'text.primary' }}
                  >
                    Create Post
                  </Button>
                  {user.role === 'admin' && (
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/admin"
                      startIcon={<AdminIcon />}
                      sx={{ color: 'text.primary' }}
                    >
                      Admin
                    </Button>
                  )}
                  
                  <IconButton
                    onClick={handleMenu}
                    size="small"
                    sx={{ color: 'text.primary' }}
                  >
                    <Avatar 
                      src={user.avatar} 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: `2px solid ${theme.palette.primary.main}`
                      }}
                    >
                      {user.name[0]}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1, color: 'text.secondary' }} /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ color: 'text.primary' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            bgcolor: 'background.paper',
            borderRight: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 