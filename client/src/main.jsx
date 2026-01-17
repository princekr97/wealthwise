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
import { muiTheme } from './theme/muiTheme.js';
import GlobalStyles from './theme/GlobalStyles.jsx';
import './styles/index.css';

import { ThemeContextProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyles />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);