import { apiClient } from '../services/api';

/**
 * Modern PDF Generation using Backend API
 * Replaces client-side jsPDF with server-side HTML-to-PDF conversion
 */

export const generateGroupReport = async (group, expenses, balances, preview = false) => {
  try {
    console.log('📄 Generating PDF with data:', { 
      groupName: group.name, 
      memberCount: group.members?.length,
      expenseCount: expenses?.length,
      hasBalances: !!balances 
    });

    const response = await apiClient.post(
      '/pdf/trip-report',
      {
        group,
        expenses,
        balances,
      },
      {
        responseType: 'arraybuffer', // Use arraybuffer instead of blob for binary data
        headers: {
          'Accept': 'application/pdf',
        },
      }
    );

    console.log('✅ PDF received, size:', response.data.byteLength, 'bytes');

    // Create blob from arraybuffer
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Create URL
    const url = URL.createObjectURL(blob);

    if (preview) {
      return url; // Return URL for previewing
    }

    // Generate filename
    const filename = `${group.name.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
    
    // Create download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup URL after delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    
    return true;
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    throw error;
  }
};


// CSV export remains the same
export const generateGroupCSV = (group, expenses) => {
  const headers = [
    'Date',
    'Description',
    'Category',
    'Paid By',
    'Amount',
    'Currency',
  ];

  const rows = expenses.map((exp) => [
    new Date(exp.date).toLocaleDateString(),
    `"${exp.description}"`,
    exp.category,
    `"${exp.paidBy?.name || exp.paidByName || 'Unknown'}"`,
    exp.amount,
    group.currency || 'INR',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${group.name.replace(/\s+/g, '_')}_Expenses.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
