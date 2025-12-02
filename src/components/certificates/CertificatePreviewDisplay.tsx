"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface CertificatePreviewDisplayProps {
  certificatePreviewHtml: string | null;
}

const CertificatePreviewDisplay: React.FC<CertificatePreviewDisplayProps> = ({ certificatePreviewHtml }) => {
  if (!certificatePreviewHtml) {
    return null;
  }

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Certificate Preview</h3>
      <div dangerouslySetInnerHTML={{ __html: certificatePreviewHtml }} className="prose dark:prose-invert max-w-none" />
    </Card>
  );
};

export default CertificatePreviewDisplay;