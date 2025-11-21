/**
 * Global Styles for WealthWise
 * Ensures consistent form input styling across all pages
 */

import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={{
        // TextField and input styling
        '& input, & textarea, & select': {
          color: '#0F172A !important',
          backgroundColor: '#F8FAFC !important',
          fontSize: '0.9375rem'
        },
        // Autofill styling
        '& input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #F8FAFC inset !important',
          WebkitTextFillColor: '#0F172A !important'
        },
        '& input:-webkit-autofill:focus': {
          WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
          WebkitTextFillColor: '#0F172A !important'
        },
        // Select styling
        '& .MuiSelect-root': {
          color: '#0F172A !important'
        },
        '& .MuiSelect-icon': {
          color: '#0F172A !important'
        },
        // Input label styling
        '& .MuiInputLabel-root': {
          color: '#475569 !important'
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#22C55E !important'
        },
        // Dialog text color
        '& .MuiDialog-paper': {
          backgroundColor: '#1E293B'
        },
        '& .MuiDialogTitle-root': {
          color: '#F1F5F9',
          fontWeight: 700
        },
        '& .MuiDialogContent-root': {
          color: '#CBD5E1'
        },
        // Card text
        '& .MuiCard-root': {
          backgroundColor: 'rgba(30, 41, 59, 0.8)'
        },
        // Table styling
        '& .MuiTableHead-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        },
        '& .MuiTableCell-root': {
          color: '#F1F5F9',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        // Button styling
        '& .MuiButton-root': {
          fontWeight: 600
        },
        // Typography
        '& .MuiTypography-root': {
          color: '#F1F5F9'
        },
        '& .MuiTypography-colorTextSecondary': {
          color: '#CBD5E1 !important'
        },
        // Form labels
        '& label': {
          color: '#475569'
        }
      }}
    />
  );
}
