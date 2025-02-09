import AppRoutes from "./components/Routes";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProviderWrapper } from "./Theme/toggleTheme";
import { Provider } from "react-redux";
import store from "./reduxState/store";

function App() {

  return (
    <Provider store={store}>
    <ThemeProviderWrapper>
      <CssBaseline />
      <AppRoutes/>
   </ThemeProviderWrapper>
   </Provider>
  );
}

export default App;
