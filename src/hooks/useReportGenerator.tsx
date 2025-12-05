"use client";

import React, { useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { generatePdfReport } from "@/utils/pdfGenerator"; // Import new PDF utility
import { exportCsv } from "@/utils/csvExporter"; // Import new CSV utility
import { generatePrintPreviewHtml } from "@/utils/printPreviewGenerator"; // Import new print preview utility

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
    republicText, departmentText, regionText, divisionText,
    leftHeaderLogoMargin, rightHeaderLogoMargin, // Get new margin settings
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
  }, [db, reportType, reportFromDate, reportToDate, reportViolationType]);


  const handleGeneratePDFReport = useCallback(async (records: any[]) => {
    try {
      await generatePdfReport({
        records,
        schoolName,
        schoolAddress,
        leftHeaderLogoData,
        rightHeaderLogoData,
        guidanceOfficer,
        guidanceOfficerPosition,
        cpcGuidanceOfficerName,
        cpcGuidanceOfficerPosition,
        principalName,
        principalPosition,
        assistantPrincipalName,
        assistantPrincipalPosition,
        republicText,
        departmentText,
        regionText,
        divisionText,
        leftHeaderLogoMargin, // Pass new prop
        rightHeaderLogoMargin, // Pass new prop
      });
      showAlert('PDF report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showAlert('Failed to generate PDF report. Please try again.', 'error');
    }
  }, [showAlert, schoolName, schoolAddress, leftHeaderLogoData, rightHeaderLogoData, guidanceOfficer, guidanceOfficerPosition, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, principalName, principalPosition, assistantPrincipalName, assistantPrincipalPosition, republicText, departmentText, regionText, divisionText, leftHeaderLogoMargin, rightHeaderLogoMargin]);

  const handleExportCSV = useCallback(async (records: any[]) => {
    try {
      await exportCsv(records);
      showAlert('CSV report exported successfully!', 'success');
    } catch (error) {
      console.error('CSV export error:', error);
      showAlert('Failed to export CSV report. Please try again.', 'error');
    }
  }, [showAlert]);

  const handleGeneratePrintPreview = useCallback(async (records: any[]) => {
    try {
      const htmlContent = generatePrintPreviewHtml({
        records,
        schoolName,
        schoolAddress,
        leftHeaderLogoData,
        rightHeaderLogoData,
        guidanceOfficer,
        guidanceOfficerPosition,
        cpcGuidanceOfficerName,
        cpcGuidanceOfficerPosition,
        principalName,
        principalPosition,
        assistantPrincipalName,
        assistantPrincipalPosition,
        republicText,
        departmentText,
        regionText,
        divisionText,
        leftHeaderLogoMargin, // Pass new prop
        rightHeaderLogoMargin, // Pass new prop
      });
      setReportPreviewContent(htmlContent);
      showAlert('Print preview generated!', 'success');
    } catch (error) {
      console.error('Print preview generation error:', error);
      showAlert('Failed to generate print preview. Please try again.', 'error');
    }
  }, [showAlert, schoolName, schoolAddress, leftHeaderLogoData, rightHeaderLogoData, guidanceOfficer, guidanceOfficerPosition, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, principalName, principalPosition, assistantPrincipalName, assistantPrincipalPosition, republicText, departmentText, regionText, divisionText, leftHeaderLogoMargin, rightHeaderLogoMargin]);

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
              th, td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; vertical-align: top; } /* Added vertical-align */
              th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              
              .print-signatures-grid { 
                margin-top: 4rem; 
                display: flex; 
                flex-direction: column;
                gap: 2rem; /* Space between rows of signatures */
                padding: 0 20mm; 
                page-break-inside: avoid; 
              }
              .signature-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 4rem; /* Space between left and right columns */
              }
              .signature-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-start; /* Align label to start */
              }
              .signature-label { 
                font-weight: normal; 
                color: #000; 
                font-size: 9pt; 
                text-align: left; 
                margin-bottom: 0.2rem; 
                width: 100%; /* Ensure label takes full width for alignment */
              }
              .signature-block { 
                text-align: center; 
                flex-shrink: 0; 
                width: 100%; /* Ensure block takes full width for centering */
                margin-top: 0.5rem; /* Space between label and name */
              } 
              .signature-name { 
                font-weight: bold; 
                color: #000; 
                margin-bottom: 0.5rem; 
                font-size: 11pt; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                display: block; /* Ensure it's a block for centering */
              }
              .signature-line { 
                border-bottom: 1px solid #000; 
                margin: 0 auto; 
                width: 80%; /* Adjust width of underline */
                height: 12px; 
                display: block; /* Ensure it's a block for centering */
              }
              .signature-title { 
                font-weight: normal; 
                color: #000; 
                font-size: 9pt; 
                margin-top: 0.5rem; 
                display: block; /* Ensure it's a block for centering */
              }
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
    generatePDFReport: handleGeneratePDFReport,
    exportCSV: handleExportCSV,
    generatePrintPreview: handleGeneratePrintPreview,
    printReport,
  };
};