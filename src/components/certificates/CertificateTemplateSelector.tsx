"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CertificateTemplateSelectorProps {
  certificateTemplate: string;
  setCertificateTemplate: (template: string) => void;
  saveSetting: (key: string, value: any) => Promise<void>;
}

const CertificateTemplateSelector: React.FC<CertificateTemplateSelectorProps> = ({
  certificateTemplate,
  setCertificateTemplate,
  saveSetting,
}) => {
  const handleTemplateChange = (template: string) => {
    setCertificateTemplate(template);
    saveSetting('certificateTemplate', template);
  };

  return (
    <div>
      <Label htmlFor="certificateTemplate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
        Certificate Template
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'standard' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          onClick={() => handleTemplateChange('standard')}
        >
          <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">📄 Standard Template</div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">Professional format with school logo</div>
        </Card>
        <Card
          className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'custom' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          onClick={() => handleTemplateChange('custom')}
        >
          <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">✏️ Custom Template</div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">Editable content and format</div>
        </Card>
      </div>
    </div>
  );
};

export default CertificateTemplateSelector;