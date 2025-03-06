import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpGuide from './HelpGuide';

const Header = ({ toggleSidebar }) => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Gestionnaire de Budget
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Aide">
              <IconButton color="inherit" onClick={() => setHelpOpen(true)}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Composant d'aide */}
      <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Header;