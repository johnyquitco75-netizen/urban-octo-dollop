"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { jsPDF } from 'jspdf';

// Import new modular components
import ReportSummaryCards from "./ReportSummaryCards";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";
import ReportPreviewDisplay from "./ReportPreviewDisplay";

const ReportsSection = () => {
  const { db, showAlert, customViolations, schoolName, schoolAddress, leftHeaderLogoData, rightHeaderLogoData, guidanceOfficer, cpcGuidanceOfficerName, principalName, assistantPrincipalName } = useAppContext();

  // Reports state
  const [reportType, setReportType] = useState("custom");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [reportViolationType, setReportViolationType] = useState("all");
  const [reportPreviewContent, setReportPreviewContent] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);

  const updateReportSummary = useCallback(async () => {
    const records = await db.getAllRecords();
    const now = new Date();

    const daily = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate.toDateString() === now.toDateString();
    }).length;
    setDailyCount(daily);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekly = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate >= weekStart;
    }).length;
    setWeeklyCount(weekly);

    const monthly = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate.getMonth() === now.getMonth() &&
             recordDate.getFullYear() === now.getFullYear();
    }).length;
    setMonthlyCount(monthly);
  }, [db]);

  useEffect(() => {
    updateReportSummary();
  }, [updateReportSummary]);

  const getFilteredRecords = async () => {
    const records = await db.getAllRecords();
    let filteredRecords = records;

    if (reportViolationType !== "all") {
      filteredRecords = filteredRecords.filter(r => r.violationType === reportViolationType);
    }

    const now = new Date();
    if (reportType === 'daily') {
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate.toDateString() === now.toDateString();
      });
    } else if (reportType === 'weekly') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate >= weekStart;
      });
    } else if (reportType === 'monthly') {
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate.getMonth() === now.getMonth() &&
               recordDate.getFullYear() === now.getFullYear();
      });
    } else if (reportType === 'custom') {
      if (reportFromDate && reportToDate) {
        filteredRecords = filteredRecords.filter(r => {
          const recordDateTime = new Date(r.dateTime).getTime();
          const fromDateTime = new Date(reportFromDate).setHours(0, 0, 0, 0);
          const toDateTime = new Date(reportToDate).setHours(23, 59, 59, 999);
          return recordDateTime >= fromDateTime && recordDateTime <= toDateTime;
        });
      }
    }
    return filteredRecords.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  };

  const generateReport = async () => {
    const records = await getFilteredRecords();
    if (reportFormat === 'pdf') {
      await generatePDFReport(records);
    } else if (reportFormat === 'csv') {
      await exportCSV(records);
    } else if (reportFormat === 'print') {
      await generatePrintPreview(records);
    }
  };

  const generatePDFReport = async (records: any[]) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 10; // Initial Y position

      // Header Logos and Institutional Text
      const logoWidth = 25;
      const logoHeight = 25;
      const leftLogoX = 20;
      const rightLogoX = 190 - logoWidth - 20; // 190 is page width - right margin - logo width

      if (leftHeaderLogoData) {
        try {
          pdf.addImage(leftHeaderLogoData, 'JPEG', leftLogoX, yPosition, logoWidth, logoHeight);
        } catch (e) {
          console.log('Could not add left header logo to PDF');
        }
      }
      if (rightHeaderLogoData) {
        try {
          pdf.addImage(rightHeaderLogoData, 'JPEG', rightLogoX, yPosition, logoWidth, logoHeight);
        } catch (e) {
          console.log('Could not add right header logo to PDF');
        }
      }

      // Center institutional text
      yPosition += 5; // Start text slightly below logos
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('Republic of the Philippines', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Department of Education', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Region VII, Central Visayas', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Division of Cebu City', 105, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(schoolName.toUpperCase(), 105, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(schoolAddress, 105, yPosition, { align: 'center' });
      yPosition += 10; // Space after address

      // Main Report Title
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('E-Guidance Record System Report', 105, yPosition, { align: 'center' });
      yPosition += 15;

      // Total Records count
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${records.length}`, 190, yPosition, { align: 'right' });
      yPosition += 10;

      // Table Headers
      const headers = ['#', 'NAME', 'TYPE', 'GRADE', 'VIOLATION', 'DATE & TIME', 'DETAILS'];
      const colWidths = [10, 35, 20, 20, 35, 35, 35];
      const colPositions = [10];
      for (let i = 0; i < colWidths.length - 1; i++) {
        colPositions.push(colPositions[i] + colWidths[i]);
      }

      pdf.setFillColor(248, 249, 250);
      pdf.rect(10, yPosition, 190, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, colPositions[index] + 2, yPosition + 5);
      });
      pdf.setLineWidth(0.5);
      pdf.rect(10, yPosition, 190, 8);
      yPosition += 8;

      // Table Rows
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      records.forEach((record, index) => {
        if (yPosition > 270) { // Check for page break
          pdf.addPage();
          yPosition = 20; // Reset yPosition for new page
          // Re-add headers on new page
          pdf.setFillColor(248, 249, 250);
          pdf.rect(10, yPosition, 190, 8, 'F');
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          headers.forEach((header, idx) => {
            pdf.text(header, colPositions[idx] + 2, yPosition + 5);
          });
          pdf.setLineWidth(0.5);
          pdf.rect(10, yPosition, 190, 8);
          yPosition += 8;
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(8);
        }
        const recordDate = new Date(record.dateTime);
        const formattedDate = recordDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        const formattedTime = recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const rowData = [
          (index + 1).toString(),
          record.name,
          record.type,
          record.gradeLevel || 'N/A',
          record.violationType,
          `${formattedDate}\n${formattedTime}`,
          record.details || 'N/A'
        ];
        const rowHeight = 12;
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(10, yPosition, 190, rowHeight, 'F');
        }
        rowData.forEach((data, colIndex) => {
          const lines = pdf.splitTextToSize(data, colWidths[colIndex] - 4);
          lines.forEach((line, lineIndex) => {
            pdf.text(line, colPositions[colIndex] + 2, yPosition + 5 + (lineIndex * 4));
          });
        });
        yPosition += rowHeight;
      });

      yPosition += 20; // Space before signatures

      // Signature blocks (2x2 layout)
      const signatureBlocks = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ];

      const blockWidth = 80; // Width for each signature block
      const horizontalSpacing = 30; // Space between left and right blocks
      const verticalSpacing = 25; // Space between rows of signatures

      let currentY = yPosition;

      // Row 1: Guidance Officer and CPC/Guidance Officer
      if (signatureBlocks[0].name || signatureBlocks[1].name) {
        if (currentY > 270) { pdf.addPage(); currentY = 20; }
        
        // Guidance Officer (Left)
        if (signatureBlocks[0].name) {
          const x = 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[0].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[0].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }

        // CPC/Guidance Officer (Right)
        if (signatureBlocks[1].name) {
          const x = 190 - blockWidth - 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[1].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[1].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }
        currentY += verticalSpacing;
      }

      // Row 2: Principal and Assistant Principal
      if (signatureBlocks[2].name || signatureBlocks[3].name) {
        if (currentY > 270) { pdf.addPage(); currentY = 20; }

        // Principal (Left)
        if (signatureBlocks[2].name) {
          const x = 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[2].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[2].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }

        // Assistant Principal (Right)
        if (signatureBlocks[3].name) {
          const x = 190 - blockWidth - 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[3].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[3].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }
        currentY += verticalSpacing;
      }

      const fileName = `guidance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('PDF report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showAlert('Failed to generate PDF report. Please try again.', 'error');
    }
  };

  const exportCSV = async (records: any[]) => {
    const headers = ['Name', 'Type', 'Grade Level', 'Violation Type', 'Date', 'Time', 'Details'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        `"${record.name}"`,
        `"${record.type}"`,
        `"${record.gradeLevel || ''}"`,
        `"${record.violationType}"`,
        `"${new Date(record.dateTime).toLocaleDateString()}"`,
        `"${new Date(record.dateTime).toLocaleTimeString()}"`,
        `"${record.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guidance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('CSV report exported successfully!', 'success');
  };

  const generatePrintPreview = async (records: any[]) => {
    const signatureBlocks = [
      { name: guidanceOfficer, title: 'Guidance Officer' },
      { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
      { name: principalName, title: 'Principal' },
      { name: assistantPrincipalName, title: 'Assistant Principal' }
    ];

    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftHeaderLogoData ? `<img src="${leftHeaderLogoData}" class="header-logo left-logo" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <p style="margin: 0; font-size: 10pt;">Republic of the Philippines</p>
              <p style="margin: 0; font-size: 10pt;">Department of Education</p>
              <p style="margin: 0; font-size: 10pt;">Region VII, Central Visayas</p>
              <p style="margin: 0; font-size: 10pt;">Division of Cebu City</p>
              <p style="margin: 0; font-size: 12pt; font-weight: bold; margin-top: 5px;">${schoolName.toUpperCase()}</p>
              <p style="margin: 0; font-size: 10pt;">${schoolAddress}</p>
          </div>
          ${rightHeaderLogoData ? `<img src="${rightHeaderLogoData}" class="header-logo right-logo" alt="Right Logo">` : ''}
      </div>
      <div class="text-center mb-8">
          <h2 class="text-xl font-bold text-gray-900 mt-4">E-Guidance Record System Report</h2>
          <div class="text-lg text-gray-600 mt-4 text-right" style="padding-right: 20px;">Total Records: ${records.length}</div>
      </div>
    `;

    const content = `
      ${headerHtml}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse mt-4 bg-white rounded-lg shadow-sm">
            <thead>
                <tr class="bg-gray-100 text-gray-700 text-sm uppercase font-semibold tracking-wider">
                    <th class="py-3 px-4 text-left">#</th>
                    <th class="py-3 px-4 text-left">NAME</th>
                    <th class="py-3 px-4 text-left">TYPE</th>
                    <th class="py-3 px-4 text-left">GRADE</th>
                    <th class="py-3 px-4 text-left">VIOLATION</th>
                    <th class="py-3 px-4 text-left">DATE & TIME</th>
                    <th class="py-3 px-4 text-left">DETAILS</th>
                </tr>
            </thead>
            <tbody>
                ${records.map((record, index) => `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="py-3 px-4">${index + 1}</td>
                        <td class="py-3 px-4 font-medium text-gray-800">${record.name}</td>
                        <td class="py-3 px-4"><span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${record.type}</span></td>
                        <td class="py-3 px-4">${record.gradeLevel || 'N/A'}</td>
                        <td class="py-3 px-4">${record.violationType}</td>
                        <td class="py-3 px-4">
                            ${new Date(record.dateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}<br>
                            ${new Date(record.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td class="py-3 px-4 text-gray-600">${record.details || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
      </div>
      <div class="print-signatures-grid">
          ${signatureBlocks[0].name ? `
              <div class="signature-block">
                  <div class="signature-name">${signatureBlocks[0].name.toUpperCase()}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">${signatureBlocks[0].title}</div>
              </div>
          ` : '<div class="signature-block"></div>'}
          ${signatureBlocks[1].name ? `
              <div class="signature-block">
                  <div class="signature-name">${signatureBlocks[1].name.toUpperCase()}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">${signatureBlocks[1].title}</div>
              </div>
          ` : '<div class="signature-block"></div>'}
          ${signatureBlocks[2].name ? `
              <div class="signature-block">
                  <div class="signature-name">${signatureBlocks[2].name.toUpperCase()}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">${signatureBlocks[2].title}</div>
              </div>
          ` : '<div class="signature-block"></div>'}
          ${signatureBlocks[3].name ? `
              <div class="signature-block">
                  <div class="signature-name">${signatureBlocks[3].name.toUpperCase()}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">${signatureBlocks[3].title}</div>
              </div>
          ` : '<div class="signature-block"></div>'}
      </div>
    `;
    setReportPreviewContent(content);
    showAlert('Print preview generated!', 'success');
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Report Print Preview</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: sans-serif; margin: 0; padding: 0; }
              .header-section { display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative; }
              .header-logo { position: absolute; width: 60px; height: 60px; object-fit: contain; top: 0; }
              .left-logo { left: 20px; }
              .right-logo { right: 20px; }
              .text-center { text-align: center; }
              .mb-8 { margin-bottom: 2rem; }
              h1 { font-size: 24pt; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937; }
              h2 { font-size: 16pt; margin-bottom: 1rem; color: #4b5563; }
              .total-records { font-size: 12pt; color: #6b7280; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: auto; }
              th, td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
              th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              
              .print-signatures-grid { 
                margin-top: 4rem; 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 2rem 4rem; /* row-gap column-gap */
                padding: 0 20mm; /* Match page margins */
                page-break-inside: avoid; 
              }
              .signature-block { text-align: center; }
              .signature-name { font-weight: bold; color: #000; margin-bottom: 0.5rem; font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; }
              .signature-line { border-bottom: 2px solid #000; margin: 0 auto; width: 80%; height: 12px; } /* Adjusted width and height */
              .signature-title { font-weight: 600; color: #000; font-size: 11pt; margin-top: 0.5rem; }
            </style>
          </head>
          <body>
            ${reportPreviewContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <section id="reports" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Generate Reports</h2>

      <ReportSummaryCards
        dailyCount={dailyCount}
        weeklyCount={weeklyCount}
        monthlyCount={monthlyCount}
      />

      <ReportFilters
        reportType={reportType}
        setReportType={setReportType}
        reportFormat={reportFormat}
        setReportFormat={setReportFormat}
        reportFromDate={reportFromDate}
        setReportFromDate={setReportFromDate}
        reportToDate={reportToDate}
        setReportToDate={setReportToDate}
        reportViolationType={reportViolationType}
        setReportViolationType={setReportViolationType}
        customViolations={customViolations}
      />

      <ReportActions
        generateReport={generateReport}
        printReport={printReport}
        reportPreviewContent={reportPreviewContent}
      />

      <ReportPreviewDisplay reportPreviewContent={reportPreviewContent} />
    </section>
  );
};

export default ReportsSection;