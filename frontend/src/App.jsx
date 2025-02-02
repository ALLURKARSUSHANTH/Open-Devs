import AppRoutes from "./components/Routes";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProviderWrapper } from "./Theme/toggleTheme";


function App() {


  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <AppRoutes/>
   </ThemeProviderWrapper>
  );
}

export default App;
