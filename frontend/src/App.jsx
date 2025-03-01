import React from 'react';
import AppRoutes from "./components/Routes";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProviderWrapper } from "./Theme/toggleTheme";
import { Provider } from "react-redux";
import store from "./reduxState/store";
import { SocketProvider } from './context/SocketContext.jsx'; 

function App() {
  return (
    <Provider store={store}>
      <ThemeProviderWrapper>
        <CssBaseline />
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </ThemeProviderWrapper>
    </Provider>
  );
}

export default App;