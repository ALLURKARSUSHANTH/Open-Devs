import { Drawer, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, createTheme, ThemeProvider } from '@mui/material'
import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import {Home,AccountCircleOutlined,Phone} from '@mui/icons-material';


const NavBar = () => {
  const [open,setOpen] = useState(false)

  const toggleDrawer =(newOpen)=>()=>{
    setOpen(newOpen)
  }
  const theme = createTheme({
    palette:{
      background:{
        default : 'blue'
      },
    },
  })
   const DrawerList=(
    <Box sx={{width:320}}>
       <List>
        {['Home', 'Contact', 'About'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton component={Link} to={`/${text.toLowerCase()}`}>
              <ListItemIcon>
                {index % 2===0 ? <Home /> : index===2? (<Phone/>):(<AccountCircleOutlined/>)}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
   
  return (
  
       <ThemeProvider  theme ={theme}>
          <div>
      <Button onClick={toggleDrawer(true)}>Open drawer</Button>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <div>{DrawerList}</div>
      </Drawer>
      </div>
      </ThemeProvider>

  )
}

export default NavBar
