import AppRoutes from "./components/Routes";
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
