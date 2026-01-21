/**
 * WealthWise Frontend Entry
 *
 * Mounts the React application with MUI theme provider.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import { createMuiTheme } from './theme/muiTheme.js';
import GlobalStyles from './theme/GlobalStyles.jsx';
import './styles/index.css';

import { ThemeContextProvider, useThemeContext } from './context/ThemeContext';

const ThemeWrapper = ({ children }) => {
  const { mode } = useThemeContext();
  const theme = React.useMemo(() => createMuiTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <ThemeWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeWrapper>
    </ThemeContextProvider>
  </React.StrictMode>
);