"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { jsPDF } from 'jspdf';

const ReportsSection = () => {
  const { db, showAlert, customViolations, schoolName, logoData, guidanceOfficer, cpcGuidanceOfficerName, principalName, assistantPrincipalName } = useAppContext();

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
      let yPosition = 20;

      if (logoData) {
        try {
          pdf.addImage(logoData, 'JPEG', 85, yPosition, 40, 40);
          yPosition += 50;
        } catch (e) {
          console.log('Could not add logo to PDF');
        }
      }

      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text(schoolName, 105, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text('E-Guidance Record System Report', 105, yPosition, { align: 'center' });
      yPosition += 15;
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${records.length}`, 190, yPosition, { align: 'right' });
      yPosition += 10;

      const headers = ['#', 'NAME', 'TYPE', 'GRADE', 'VIOLATION', 'DATE & TIME', 'DETAILS'];
      const colWidths = [15, 40, 25, 25, 35, 30, 40];
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
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        const rowData = [
          (index + 1).toString(),
          record.name,
          record.type,
          record.gradeLevel || 'N/A',
          record.violationType,
          `${new Date(record.dateTime).toLocaleDateString()}\n${new Date(record.dateTime).toLocaleTimeString()}`,
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

      yPosition += 20;
      const signaturePositions = [40, 80, 120, 160];
      const officers = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ];
      officers.forEach((officer, index) => {
        if (officer.name) {
          pdf.setFont(undefined, 'bold');
          pdf.text(officer.name.toUpperCase(), signaturePositions[index], yPosition, { align: 'center' });
          pdf.line(signaturePositions[index] - 30, yPosition + 2, signaturePositions[index] + 30, yPosition + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(officer.title, signaturePositions[index], yPosition + 8, { align: 'center' });
        }
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
    const content = `
      <div class="print-header text-center mb-12 border-b-2 border-gray-300 pb-8">
          ${logoData ? `<img src="${logoData}" class="print-logo w-24 h-24 rounded-xl object-cover mx-auto mb-4 border-2 border-gray-300" alt="School Logo">` : ''}
          <h1 class="text-3xl font-bold text-gray-900">${schoolName}</h1>
          <h2 class="text-xl text-gray-700 mt-2">E-Guidance Record System Report</h2>
          <div class="text-lg text-gray-600 mt-4">Total Records: ${records.length}</div>
      </div>
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
                            ${new Date(record.dateTime).toLocaleDateString()}<br>
                            ${new Date(record.dateTime).toLocaleTimeString()}
                        </td>
                        <td class="py-3 px-4 text-gray-600">${record.details || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
      </div>
      <div class="flex justify-between mt-16 gap-16 px-8 print:flex-wrap print:gap-8">
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
              .print-header { text-align: center; margin-bottom: 3rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 2rem; }
              .print-logo { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; margin: 0 auto 1rem; display: block; border: 2px solid #e5e7eb; }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📅 Daily Summary</h3>
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{dailyCount}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Today's Records</div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📊 Weekly Summary</h3>
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">{weeklyCount}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">This Week</div>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📈 Monthly Summary</h3>
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{monthlyCount}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">This Month</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="reportType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Report Type
          </Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Date Range</SelectItem>
              <SelectItem value="daily">Daily Report</SelectItem>
              <SelectItem value="weekly">Weekly Report</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="reportFormat" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Format
          </Label>
          <Select value={reportFormat} onValueChange={setReportFormat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="print">Print Preview</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {reportType === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="reportFromDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              From Date
            </Label>
            <Input
              id="reportFromDate"
              type="date"
              value={reportFromDate}
              onChange={(e) => setReportFromDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="reportToDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              To Date
            </Label>
            <Input
              id="reportToDate"
              type="date"
              value={reportToDate}
              onChange={(e) => setReportToDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="reportViolationType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Filter by Violation Type
        </Label>
        <Select value={reportViolationType} onValueChange={setReportViolationType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Late Arrival">Late Arrival</SelectItem>
            <SelectItem value="Uniform Violation">Uniform Violation</SelectItem>
            <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
            <SelectItem value="Academic Dishonesty">Academic Dishonesty</SelectItem>
            <SelectItem value="Bullying">Bullying</SelectItem>
            <SelectItem value="Property Damage">Property Damage</SelectItem>
            <SelectItem value="Inappropriate Language">Inappropriate Language</SelectItem>
            <SelectItem value="Technology Misuse">Technology Misuse</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
            {customViolations.map(violation => (
              <SelectItem key={violation} value={violation} className="custom-option">
                {violation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <Button onClick={generateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
          📄 Generate Report
        </Button>
        {reportPreviewContent && (
          <Button variant="secondary" onClick={printReport} className="px-6 py-3 rounded-lg">
            🖨️ Print
          </Button>
        )}
      </div>

      {reportPreviewContent && (
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Report Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: reportPreviewContent }} className="prose dark:prose-invert max-w-none" />
        </Card>
      )}
    </section>
  );
};

export default ReportsSection;