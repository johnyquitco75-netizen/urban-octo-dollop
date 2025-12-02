"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ReportActionsProps {
  generateReport: () => void;
  printReport: () => void;
  reportPreviewContent: string | null;
}

const ReportActions: React.FC<ReportActionsProps> = ({ generateReport, printReport, reportPreviewContent }) => {
  return (
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
  );
};

export default ReportActions;