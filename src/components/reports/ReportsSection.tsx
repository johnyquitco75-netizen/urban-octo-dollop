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
      let yPosition = 10; // Start higher for header

      // Header Logos
      if (leftHeaderLogoData) {
        try {
          pdf.addImage(leftHeaderLogoData, 'JPEG', 20, yPosition, 25, 25); // Left logo
        } catch (e) {
          console.log('Could not add left header logo to PDF');
        }
      }
      if (rightHeaderLogoData) {
        try {
          pdf.addImage(rightHeaderLogoData, 'JPEG', 165, yPosition, 25, 25); // Right logo
        } catch (e) {
          console.log('Could not add right header logo to PDF');
        }
      }

      // Adjust yPosition after logos, before the main title
      yPosition = Math.max(yPosition + 25, 40); // Ensure enough space for logos, or start at 40 if no logos

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('E-Guidance Record System Report', 105, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${records.length}`, 190, yPosition, { align: 'right' });
      yPosition += 10;

      const headers = ['#', 'NAME', 'TYPE', 'GRADE', 'VIOLATION', 'DATE & TIME', 'DETAILS'];
      const colWidths = [10, 35, 20, 20, 35, 35, 35]; // Adjusted column widths
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
        const rowHeight = 12; // Fixed row height for simplicity, adjust if multi-line details are common
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

      // Signature blocks
      const signatureBlocks = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ].filter(officer => officer.name); // Only show if name is provided

      const numSignatures = signatureBlocks.length;
      const blockWidth = 60; // Width for each signature block
      const spacing = (190 - (numSignatures * blockWidth)) / (numSignatures + 1); // Distribute evenly

      let currentX = 10 + spacing;

      signatureBlocks.forEach((officer, index) => {
        if (yPosition > 270) { // Check for page break before signatures
          pdf.addPage();
          yPosition = 20;
          currentX = 10 + spacing; // Reset X position for new page
        }

        pdf.setFont(undefined, 'bold');
        pdf.text(officer.name.toUpperCase(), currentX + (blockWidth / 2), yPosition, { align: 'center' });
        pdf.line(currentX, yPosition + 2, currentX + blockWidth, yPosition + 2);
        pdf.setFont(undefined, 'normal');
        pdf.text(officer.title, currentX + (blockWidth / 2), yPosition + 8, { align: 'center' });

        currentX += blockWidth + spacing;
      });


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
    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftHeaderLogoData ? `<img src="${leftHeaderLogoData}" class="header-logo left-logo" style="position: absolute; left: 20px; top: 0; width: 60px; height: 60px; object-fit: contain;" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <!-- Removed hardcoded institutional text and school details -->
          </div>
          ${rightHeaderLogoData ? `<img src="${rightHeaderLogoData}" class="header-logo right-logo" style="position: absolute; right: 20px; top: 0; width: 60px; height: 60px; object-fit: contain;" alt="Right Logo">` : ''}
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
      <div class="flex justify-around mt-16 gap-8 px-8 print:flex-wrap print:gap-8">
          ${guidanceOfficer ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidanceOfficer.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
              </div>
          ` : ''}
          ${cpcGuidanceOfficerName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpcGuidanceOfficerName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
              </div>
          ` : ''}
          ${principalName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principalName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Principal</div>
              </div>
          ` : ''}
          ${assistantPrincipalName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistantPrincipalName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
              </div>
          ` : ''}
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
              .header-logo { position: absolute; width: 60px; height: 60px; object-fit: contain; }
              .left-logo { left: 20px; top: 0; }
              .right-logo { right: 20px; top: 0; }
              .text-center { text-align: center; }
              .mb-8 { margin-bottom: 2rem; }
              h1 { font-size: 24pt; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937; }
              h2 { font-size: 16pt; margin-bottom: 1rem; color: #4b5563; }
              .total-records { font-size: 12pt; color: #6b7280; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: auto; }
              th, td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
              th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              .print-signatures { margin-top: 4rem; display: flex; justify-content: space-between; page-break-inside: avoid; gap: 4rem; padding: 0 2rem; }
              .signature-block { text-align: center; min-w: 200px; flex: 1; }
              .signature-name { font-weight: bold; color: #000; margin-bottom: 0.5rem; font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; }
              .signature-line { border-bottom: 2px solid #000; margin-bottom: 0.5rem; height: 50px; width: 100%; }
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