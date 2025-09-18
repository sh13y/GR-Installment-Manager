import jsPDF from 'jspdf'
import { Customer } from '@/types'
import { formatDate } from './helpers'

// Extend jsPDF with autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface PaymentRecord {
  id: string
  amount: number
  payment_date: string
  sale_id?: string
  notes?: string
}

interface SaleRecord {
  id: string
  product_id: string
  quantity: number
  sale_date: string
  initial_payment: number
  total_amount: number
  remaining_balance: number
  status: string
  products?: {
    name: string
    selling_price: number
  }[]
}

export async function generateCustomerReport(
  customer: Customer,
  payments: PaymentRecord[],
  sales: SaleRecord[]
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const autoTable = (await import('jspdf-autotable')).default;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Colors and fonts
  const primaryColor: [number, number, number] = [0, 123, 255]; // Blue
  const secondaryColor: [number, number, number] = [108, 117, 125]; // Gray
  const accentColor: [number, number, number] = [220, 53, 69]; // Red for outstanding
  const font = 'helvetica'; // Change from courier to helvetica for a modern look

  // Header
  doc.setFont(font, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Customer Financial Report', pageWidth / 2, 70, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(font, 'normal');
  doc.text('Installments Management System', pageWidth / 2, 90, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, margin, 110);

  let yPos = 130;

  // Customer Information Section
  doc.setFont(font, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Customer Details', margin, yPos);
  yPos += 20;

  doc.setFont(font, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const customerInfo = [
    ['Name:', customer.full_name],
    ['NIC Number:', customer.nic_number],
    ['Phone:', customer.phone],
    ['Address:', customer.address || 'N/A'],
    ['Registration Date:', formatDate(customer.created_at)],
    ['Status:', customer.is_active ? 'Active' : 'Inactive']
  ];

  customerInfo.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, margin, yPos);
    yPos += 15;
  });

  yPos += 20;

  // Summary Section as a table
  doc.setFont(font, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('Account Summary', margin, yPos);
  yPos += 20;

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const outstanding = totalSales - totalPaid;

  const summaryData = [
    ['Total Purchases', `Rs. ${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['Total Payments', `Rs. ${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['Outstanding Balance', `Rs. ${outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Summary Item', 'Amount']],
    body: summaryData,
    theme: 'plain',
    styles: { font, fontSize: 10, cellPadding: 8 },
    headStyles: { fillColor: primaryColor as any, textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 150, halign: 'left' },
      1: { cellWidth: 100, halign: 'right' }
    },
    didDrawCell: (data) => {
      if (data.row.index === 2 && data.column.index === 1) {
        doc.setTextColor(...accentColor);
      } else {
        doc.setTextColor(0, 0, 0);
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 30;

  // Purchases Table
  if (sales.length > 0) {
    doc.setFont(font, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('Purchase History', margin, yPos);
    yPos += 15;
    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text('All amounts in Rupees (Rs.)', margin, yPos);
    yPos += 15;

    const purchasesData = sales.map(sale => [
      formatDate(sale.sale_date),
      sale.products?.[0]?.name || 'Unknown Product',
      sale.quantity.toString(),
      `Rs. ${(sale.products?.[0]?.selling_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `Rs. ${sale.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `Rs. ${sale.initial_payment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `Rs. ${sale.remaining_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Product', 'Qty', 'Unit Price', 'Total Amount', 'Initial Payment', 'Balance']],
      body: purchasesData,
      theme: 'striped',
      styles: { font, fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: secondaryColor as any, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 70, halign: 'center' },
        1: { cellWidth: 120, halign: 'left' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 80, halign: 'right' },
        4: { cellWidth: 80, halign: 'right' },
        5: { cellWidth: 80, halign: 'right' },
        6: { cellWidth: 80, halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 30;
  }

  // Payments Table
  if (payments.length > 0) {
    doc.setFont(font, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('Payment History', margin, yPos);
    yPos += 15;
    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text('All amounts in Rupees (Rs.)', margin, yPos);
    yPos += 15;

    const paymentsData = payments.map(payment => [
      formatDate(payment.payment_date),
      `Rs. ${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      payment.notes || 'No notes'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Amount', 'Notes']],
      body: paymentsData,
      theme: 'grid',
      styles: { font, fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: secondaryColor as any, textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 100, halign: 'center' },
        1: { cellWidth: 100, halign: 'right' },
        2: { cellWidth: contentWidth - 200, halign: 'left' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 30;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    doc.text('Thank you for your business - Installments Management System', margin, pageHeight - 30);
  }

  const fileName = `${customer.full_name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

