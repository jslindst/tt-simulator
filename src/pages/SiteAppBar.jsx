import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from "react-router-dom";


/*
const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  minHeight: {
    minHeight: "5px !important",
  },
  smallTypo: {
    fontSize: "5px"
  }
}));
*/

export const SiteAppBar = (props) => {

  let navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const goTo = (url) => {
    navigate(url);
    //    navigate(0);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar style={{
          minHeight: "15px", textAlign: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => goTo('/')}>Combat Simulator</MenuItem>
            <MenuItem onClick={() => goTo('/resourceTracker')}>Resource Tracker</MenuItem>
          </Menu>
          <Typography style={{ fontSize: "15px" }} variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {props.title}
          </Typography>
          {props.actionButton}
          {props.help}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

//          
