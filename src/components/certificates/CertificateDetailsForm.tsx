"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertificateDetailsFormProps {
  previewStudentName: string;
  setPreviewStudentName: (name: string) => void;
  certificateDate: string;
  setCertificateDate: (date: string) => void;
  saveSetting: (key: string, value: any) => Promise<void>;
}

const CertificateDetailsForm: React.FC<CertificateDetailsFormProps> = ({
  previewStudentName,
  setPreviewStudentName,
  certificateDate,
  setCertificateDate,
  saveSetting,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCertificateDate(value);
    saveSetting('certificateDate', value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <Label htmlFor="previewStudentName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Student Name (for preview)
        </Label>
        <Input
          id="previewStudentName"
          type="text"
          placeholder="Enter student name for preview"
          value={previewStudentName}
          onChange={(e) => setPreviewStudentName(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="certificateDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Certificate Date
        </Label>
        <Input
          id="certificateDate"
          type="date"
          value={certificateDate}
          onChange={handleDateChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CertificateDetailsForm;