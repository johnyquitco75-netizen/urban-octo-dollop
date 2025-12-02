"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { useReportGenerator } from "@/hooks/useReportGenerator"; // Import the new hook

// Import new modular components
import ReportSummaryCards from "./ReportSummaryCards";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";
import ReportPreviewDisplay from "./ReportPreviewDisplay";

const ReportsSection = () => {
  const { db, customViolations } = useAppContext();

  // Reports state
  const [reportType, setReportType] = useState("custom");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [reportViolationType, setReportViolationType] = useState("all");
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);

  // Use the new report generator hook
  const {
    reportPreviewContent,
    getFilteredRecords,
    generatePDFReport,
    exportCSV,
    generatePrintPreview,
    printReport,
  } = useReportGenerator({
    reportType,
    reportFormat,
    reportFromDate,
    reportToDate,
    reportViolationType,
  });

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

  const handleGenerateReport = async () => {
    const records = await getFilteredRecords();
    if (reportFormat === 'pdf') {
      await generatePDFReport(records);
    } else if (reportFormat === 'csv') {
      await exportCSV(records);
    } else if (reportFormat === 'print') {
      await generatePrintPreview(records);
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
        generateReport={handleGenerateReport}
        printReport={printReport}
        reportPreviewContent={reportPreviewContent}
      />

      <ReportPreviewDisplay reportPreviewContent={reportPreviewContent} />
    </section>
  );
};

export default ReportsSection;