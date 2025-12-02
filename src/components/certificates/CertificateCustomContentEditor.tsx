"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CertificateCustomContentEditorProps {
  customCertificateContent: string;
  setCustomCertificateContent: (content: string) => void;
  saveSetting: (key: string, value: any) => Promise<void>;
  isVisible: boolean;
}

const CertificateCustomContentEditor: React.FC<CertificateCustomContentEditorProps> = ({
  customCertificateContent,
  setCustomCertificateContent,
  saveSetting,
  isVisible,
}) => {
  if (!isVisible) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomCertificateContent(value);
    saveSetting('customCertificateContent', value);
  };

  return (
    <div className="mt-6">
      <Label htmlFor="customCertificateContent" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
        Custom Certificate Content
      </Label>
      <Textarea
        id="customCertificateContent"
        placeholder="Enter your custom certificate content. Use [STUDENT_NAME], [SCHOOL_NAME], and [DATE] as placeholders..."
        value={customCertificateContent}
        onChange={handleChange}
        className="w-full min-h-[200px]"
      />
    </div>
  );
};

export default CertificateCustomContentEditor;