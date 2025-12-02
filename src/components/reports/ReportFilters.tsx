"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReportFiltersProps {
  reportType: string;
  setReportType: (type: string) => void;
  reportFormat: string;
  setReportFormat: (format: string) => void;
  reportFromDate: string;
  setReportFromDate: (date: string) => void;
  reportToDate: string;
  setReportToDate: (date: string) => void;
  reportViolationType: string;
  setReportViolationType: (type: string) => void;
  customViolations: string[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  setReportType,
  reportFormat,
  setReportFormat,
  reportFromDate,
  setReportFromDate,
  reportToDate,
  setReportToDate,
  reportViolationType,
  setReportViolationType,
  customViolations,
}) => {
  return (
    <>
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
    </>
  );
};

export default ReportFilters;