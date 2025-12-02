"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useCertificateGenerator } from "@/hooks/useCertificateGenerator";
import CertificateTemplateSelector from "./CertificateTemplateSelector";
import CertificateCustomContentEditor from "./CertificateCustomContentEditor";
import CertificateDetailsForm from "./CertificateDetailsForm";
import CertificateActions from "./CertificateActions";
import CertificatePreviewDisplay from "./CertificatePreviewDisplay";

const CertificateSection = () => {
  const { db } = useAppContext();

  // Certificate state
  const [certificateTemplate, setCertificateTemplate] = useState("standard");
  const [customCertificateContent, setCustomCertificateContent] = useState("");
  const [previewStudentName, setPreviewStudentName] = useState("");
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom hook for certificate generation logic
  const {
    certificatePreviewHtml,
    generateCertificateContent,
    generateCertificatePDF,
    printCertificate,
  } = useCertificateGenerator({
    certificateTemplate,
    customCertificateContent,
    previewStudentName,
    certificateDate,
  });

  // Function to save settings to DB
  const saveSetting = async (key: string, value: any) => {
    await db.setSetting(key, value);
  };

  useEffect(() => {
    const loadCertificateSettings = async () => {
      const savedTemplate = await db.getSetting('certificateTemplate') || 'standard';
      const savedCustomContent = await db.getSetting('customCertificateContent') || '';
      const savedCertificateDate = await db.getSetting('certificateDate') || new Date().toISOString().split('T')[0];
      setCertificateTemplate(savedTemplate);
      setCustomCertificateContent(savedCustomContent);
      setCertificateDate(savedCertificateDate);
    };
    loadCertificateSettings();
  }, [db]);

  return (
    <section id="certificates" className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">📜 Good Moral Certificate</h3>

      <CertificateTemplateSelector
        certificateTemplate={certificateTemplate}
        setCertificateTemplate={setCertificateTemplate}
        saveSetting={saveSetting}
      />

      <CertificateCustomContentEditor
        customCertificateContent={customCertificateContent}
        setCustomCertificateContent={setCustomCertificateContent}
        saveSetting={saveSetting}
        isVisible={certificateTemplate === 'custom'}
      />

      <CertificateDetailsForm
        previewStudentName={previewStudentName}
        setPreviewStudentName={setPreviewStudentName}
        certificateDate={certificateDate}
        setCertificateDate={setCertificateDate}
        saveSetting={saveSetting}
      />

      <CertificateActions
        previewStudentName={previewStudentName}
        certificateDate={certificateDate}
        certificatePreviewHtml={certificatePreviewHtml}
        onGenerateContent={generateCertificateContent}
        onGeneratePDF={generateCertificatePDF}
        onPrintCertificate={printCertificate}
      />

      <CertificatePreviewDisplay certificatePreviewHtml={certificatePreviewHtml} />
    </section>
  );
};

export default CertificateSection;