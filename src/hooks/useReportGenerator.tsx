"use client";

import React, { useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { jsPDF } from 'jspdf';

interface UseReportGeneratorProps {
  reportType: string;
  reportFormat: string;
  reportFromDate: string;
  reportToDate: string;
  reportViolationType: string;
}

export const useReportGenerator = ({
  reportType,
  reportFormat,
  reportFromDate,
  reportToDate,
  reportViolationType,
}: UseReportGeneratorProps) => {
  const {
    db, showAlert,
    schoolName, schoolAddress,
    leftHeaderLogoData, rightHeaderLogoData,
    guidanceOfficer, guidanceOfficerPosition,
    cpcGuidanceOfficerName, cpcGuidanceOfficerPosition,
    principalName, principalPosition,
    assistantPrincipalName, assistantPrincipalPosition,
    republicText, departmentText, regionText, divisionText
  } = useAppContext();

  const [reportPreviewContent, setReportPreviewContent] = useState<string | null>(null);

  const getFilteredRecords = useCallback(async () => {
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
  }, [db, reportType, reportFormat, reportFromDate, reportToDate, reportViolationType]);


  const generatePDFReport = useCallback(async (records: any[]) => {
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
      pdf.text(republicText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(departmentText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(regionText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(divisionText, 105, yPosition, { align: 'center' });
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
      const blockWidth = 80; // Width for each signature block
      const leftColX = 20;
      const rightColX = 190 - blockWidth - 20; // Right column X position
      const lineLength = 70; // Length of the underline

      // Row 1: PREPARED BY (CPC/Guidance Officer) and Guidance Officer
      if (cpcGuidanceOfficerName || guidanceOfficer) {
        if (yPosition > 270) { pdf.addPage(); yPosition = 20; }
        
        // PREPARED BY: CPC/Guidance Officer (Left)
        if (cpcGuidanceOfficerName) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('PREPARED BY:', leftColX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(cpcGuidanceOfficerName.toUpperCase(), leftColX + (blockWidth / 2), yPosition + 8, { align: 'center' });
          pdf.line(leftColX + (blockWidth - lineLength) / 2, yPosition + 10, leftColX + (blockWidth + lineLength) / 2, yPosition + 10); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(cpcGuidanceOfficerPosition, leftColX + (blockWidth / 2), yPosition + 15, { align: 'center' });
        }

        // Guidance Officer (Right)
        if (guidanceOfficer) {
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(guidanceOfficer.toUpperCase(), rightColX + (blockWidth / 2), yPosition + 8, { align: 'center' });
          pdf.line(rightColX + (blockWidth - lineLength) / 2, yPosition + 10, rightColX + (blockWidth + lineLength) / 2, yPosition + 10); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(guidanceOfficerPosition, rightColX + (blockWidth / 2), yPosition + 15, { align: 'center' });
        }
        yPosition += 35; // Move down for next row
      }

      // Row 2: NOTED BY (Assistant Principal) and APPROVED BY (Principal)
      if (assistantPrincipalName || principalName) {
        if (yPosition > 270) { pdf.addPage(); yPosition = 20; }

        // NOTED BY: Assistant Principal (Left)
        if (assistantPrincipalName) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('NOTED BY:', leftColX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(assistantPrincipalName.toUpperCase(), leftColX + (blockWidth / 2), yPosition + 8, { align: 'center' });
          pdf.line(leftColX + (blockWidth - lineLength) / 2, yPosition + 10, leftColX + (blockWidth + lineLength) / 2, yPosition + 10); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(assistantPrincipalPosition, leftColX + (blockWidth / 2), yPosition + 15, { align: 'center' });
        }

        // APPROVED BY: Principal (Right)
        if (principalName) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('APPROVED BY:', rightColX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(principalName.toUpperCase(), rightColX + (blockWidth / 2), yPosition + 8, { align: 'center' });
          pdf.line(rightColX + (blockWidth - lineLength) / 2, yPosition + 10, rightColX + (blockWidth + lineLength) / 2, yPosition + 10); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(principalPosition, rightColX + (blockWidth / 2), yPosition + 15, { align: 'center' });
        }
        yPosition += 35; // Move down for next row
      }

      const fileName = `guidance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('PDF report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showAlert('Failed to generate PDF report. Please try again.', 'error');
    }
  }, [showAlert, leftHeaderLogoData, rightHeaderLogoData, republicText, departmentText, regionText, divisionText, schoolName, schoolAddress, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, guidanceOfficer, guidanceOfficerPosition, assistantPrincipalName, assistantPrincipalPosition, principalName, principalPosition]);

  const exportCSV = useCallback(async (records: any[]) => {
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
  }, [showAlert]);

  const generatePrintPreview = useCallback(async (records: any[]) => {
    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftHeaderLogoData ? `<img src="${leftHeaderLogoData}" class="header-logo left-logo" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <p style="margin: 0; font-size: 10pt;">${republicText}</p>
              <p style="margin: 0; font-size: 10pt;">${departmentText}</p>
              <p style="margin: 0; font-size: 10pt;">${regionText}</p>
              <p style="margin: 0; font-size: 10pt;">${divisionText}</p>
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
          <div class="signature-block-group">
              ${cpcGuidanceOfficerName ? `
                  <div class="signature-block">
                      <div class="signature-label">PREPARED BY:</div>
                      <div class="signature-name">${cpcGuidanceOfficerName.toUpperCase()}</div>
                      <div class="signature-line"></div>
                      <div class="signature-title">${cpcGuidanceOfficerPosition}</div>
                  </div>
              ` : '<div class="signature-block"></div>'}
              ${assistantPrincipalName ? `
                  <div class="signature-block mt-8">
                      <div class="signature-label">NOTED BY:</div>
                      <div class="signature-name">${assistantPrincipalName.toUpperCase()}</div>
                      <div class="signature-line"></div>
                      <div class="signature-title">${assistantPrincipalPosition}</div>
                  </div>
              ` : '<div class="signature-block"></div>'}
          </div>
          <div class="signature-block-group">
              ${guidanceOfficer ? `
                  <div class="signature-block">
                      <div class="signature-name">${guidanceOfficer.toUpperCase()}</div>
                      <div class="signature-line"></div>
                      <div class="signature-title">${guidanceOfficerPosition}</div>
                  </div>
              ` : '<div class="signature-block"></div>'}
              ${principalName ? `
                  <div class="signature-block mt-8">
                      <div class="signature-label">APPROVED BY:</div>
                      <div class="signature-name">${principalName.toUpperCase()}</div>
                      <div class="signature-line"></div>
                      <div class="signature-title">${principalPosition}</div>
                  </div>
              ` : '<div class="signature-block"></div>'}
          </div>
      </div>
    `;
    setReportPreviewContent(content);
    showAlert('Print preview generated!', 'success');
  }, [showAlert, leftHeaderLogoData, rightHeaderLogoData, republicText, departmentText, regionText, divisionText, schoolName, schoolAddress, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, guidanceOfficer, guidanceOfficerPosition, assistantPrincipalName, assistantPrincipalPosition, principalName, principalPosition]);

  const printReport = useCallback(() => {
    if (!reportPreviewContent) {
      showAlert('Please generate a preview first.', 'error');
      return;
    }
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
                display: flex; /* Use flexbox for main columns */
                justify-content: space-around; /* Distribute space between columns */
                gap: 4rem; /* Space between left and right groups */
                padding: 0 20mm; /* Match page margins */
                page-break-inside: avoid; 
              }
              .signature-block-group {
                display: flex;
                flex-direction: column;
                gap: 2rem; /* Space between blocks in a column */
                flex: 1; /* Allow groups to take equal space */
              }
              .signature-block { text-align: center; flex-shrink: 0; } /* Prevent shrinking */
              .signature-label { font-weight: normal; color: #000; font-size: 9pt; text-align: left; margin-bottom: 0.2rem; }
              .signature-name { font-weight: bold; color: #000; margin-bottom: 0.5rem; font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; }
              .signature-line { border-bottom: 1px solid #000; margin: 0 auto; width: 80%; height: 12px; }
              .signature-title { font-weight: normal; color: #000; font-size: 9pt; margin-top: 0.5rem; }
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
  }, [reportPreviewContent, showAlert]);

  return {
    reportPreviewContent,
    getFilteredRecords,
    generatePDFReport,
    exportCSV,
    generatePrintPreview,
    printReport,
  };
};