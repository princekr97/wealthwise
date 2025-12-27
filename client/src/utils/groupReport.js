import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatters';

export const generateGroupReport = (group, expenses, balances) => {
    const doc = new jsPDF();

    // -- TITLE --
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Blue
    doc.text(group.name, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Members: ${group.members.map(m => m.name).join(', ')}`, 14, 34);

    let finalY = 45;

    // Helper for PDF-safe currency
    const safeCurrency = (amount) => `Rs. ${Number(amount).toFixed(2)}`;

    // -- BALANCES SECTION --
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Current Balances', 14, finalY);
    finalY += 8;

    const balanceRows = Object.entries(balances)
        .filter(([_, bal]) => Math.abs(bal) > 0.1)
        .map(([memberId, bal]) => {
            const member = group.members.find(m => (m.userId?._id || m.userId) === memberId);
            const name = member ? member.name : 'Unknown';
            const status = bal > 0 ? 'gets back' : 'owes';
            return [name, status, safeCurrency(Math.abs(bal))];
        });

    if (balanceRows.length > 0) {
        autoTable(doc, {
            startY: finalY,
            head: [['Member', 'Status', 'Amount']],
            body: balanceRows,
            theme: 'striped',
            headStyles: { fillColor: [51, 65, 85] },
            columnStyles: { 2: { halign: 'right' } }
        });
        finalY = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("All settled up!", 14, finalY);
        finalY += 15;
    }

    // -- ANALYTICS SECTION --
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Expense Summary', 14, finalY);
    finalY += 8;

    // Calculate Totals
    const totalSpending = expenses.reduce((sum, exp) => exp.category !== 'Settlement' ? sum + exp.amount : sum, 0);

    // Category Breakdown
    const categoryTotals = expenses.reduce((acc, exp) => {
        if (exp.category === 'Settlement') return acc;
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    const categoryRows = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]) // Sort by amount desc
        .map(([cat, amount]) => [cat, safeCurrency(amount)]);

    // Display Total
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Total Group Spending: ${safeCurrency(totalSpending)}`, 14, finalY);
    finalY += 10;

    if (categoryRows.length > 0) {
        autoTable(doc, {
            startY: finalY,
            head: [['Category', 'Total Amount']],
            body: categoryRows,
            theme: 'plain',
            headStyles: { fillColor: [240, 240, 240], textColor: 50, fontStyle: 'bold' },
            columnStyles: { 1: { halign: 'right' } },
            styles: { fontSize: 10 }
        });
        finalY = doc.lastAutoTable.finalY + 15;
    } else {
        finalY += 5;
    }

    // -- EXPENSES TABLE --
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Expense History', 14, finalY);
    finalY += 8;

    const expenseRows = expenses.map(exp => {
        return [
            new Date(exp.date).toLocaleString(),
            exp.description,
            exp.category,
            exp.paidBy.name,
            safeCurrency(exp.amount)
        ];
    });

    autoTable(doc, {
        startY: finalY,
        head: [['Date', 'Description', 'Category', 'Paid By', 'Amount']],
        body: expenseRows,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }, // Green
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: { 4: { halign: 'right' } }
    });


    // Save
    doc.save(`${group.name.replace(/\s+/g, '_')}_Report.pdf`);
};

export const generateGroupCSV = (group, expenses) => {
    // CSV Header
    const headers = ['Date', 'Description', 'Category', 'Paid By', 'Amount', 'Currency'];

    // CSV Rows
    const rows = expenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        `"${exp.description}"`, // Escape quotes
        exp.category,
        `"${exp.paidBy.name}"`,
        exp.amount,
        group.currency
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${group.name.replace(/\s+/g, '_')}_Expenses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
