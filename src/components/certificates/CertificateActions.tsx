"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface CertificateActionsProps {
  previewStudentName: string;
  certificateDate: string;
  certificatePreviewHtml: string | null;
  onGenerateContent: (studentName: string, certDate: string, isPreview?: boolean) => Promise<void>;
  onGeneratePDF: () => Promise<void>;
  onPrintCertificate: () => void;
}

const CertificateActions: React.FC<CertificateActionsProps> = ({
  previewStudentName,
  certificateDate,
  certificatePreviewHtml,
  onGenerateContent,
  onGeneratePDF,
  onPrintCertificate,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <Button onClick={() => onGenerateContent(previewStudentName, certificateDate, true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
        👁️ Preview Certificate
      </Button>
      <Button variant="success" onClick={onGeneratePDF} className="px-6 py-3 rounded-lg">
        📜 Generate Certificate
      </Button>
      {certificatePreviewHtml && (
        <Button variant="secondary" onClick={onPrintCertificate} className="px-6 py-3 rounded-lg">
          🖨️ Print Certificate
        </Button>
      )}
    </div>
  );
};

export default CertificateActions;