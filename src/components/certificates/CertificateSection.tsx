"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { jsPDF } from 'jspdf';

const CertificateSection = () => {
  const { db, showAlert, schoolName, schoolAddress, leftHeaderLogoData, rightHeaderLogoData, guidanceOfficer, cpcGuidanceOfficerName, principalName, assistantPrincipalName } = useAppContext();

  // Certificate state
  const [certificateTemplate, setCertificateTemplate] = useState("standard");
  const [customCertificateContent, setCustomCertificateContent] = useState("");
  const [previewStudentName, setPreviewStudentName] = useState("");
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split('T')[0]);
  const [certificatePreviewHtml, setCertificatePreviewHtml] = useState<string | null>(null);

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

  const generateCertificateContent = async (studentName: string, certDate: string, isPreview = false) => {
    const school = schoolName;
    const address = schoolAddress;
    const leftLogo = leftHeaderLogoData;
    const rightLogo = rightHeaderLogoData;
    const guidance = guidanceOfficer;
    const cpc = cpcGuidanceOfficerName;
    const principal = principalName;
    const assistant = assistantPrincipalName;

    const signatureBlocks = [
      { name: guidance, title: 'Guidance Officer' },
      { name: cpc, title: 'CPC/Guidance Officer' },
      { name: principal, title: 'Principal' },
      { name: assistant, title: 'Assistant Principal' }
    ];

    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftLogo ? `<img src="${leftLogo}" class="header-logo left-logo" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <p style="margin: 0; font-size: 10pt;">Republic of the Philippines</p>
              <p style="margin: 0; font-size: 10pt;">Department of Education</p>
              <p style="margin: 0; font-size: 10pt;">Region VII, Central Visayas</p>
              <p style="margin: 0; font-size: 10pt;">Division of Cebu City</p>
              <p style="margin: 0; font-size: 12pt; font-weight: bold; margin-top: 5px;">${school.toUpperCase()}</p>
              <p style="margin: 0; font-size: 10pt;">${address}</p>
          </div>
          ${rightLogo ? `<img src="${rightLogo}" class="header-logo right-logo" alt="Right Logo">` : ''}
      </div>
      <div class="text-center mb-8">
          <h2 class="text-xl font-bold text-gray-900 mt-4">CERTIFICATE OF GOOD MORAL CHARACTER</h2>
      </div>
    `;

    let content = '';
    if (certificateTemplate === 'standard') {
      content = `
        ${headerHtml}
        <div class="text-lg text-gray-800 text-justify my-8 leading-relaxed">
            <p>TO WHOM IT MAY CONCERN:</p>
            <p class="mt-8">This is to certify that <span class="font-bold underline text-black">${studentName.toUpperCase()}</span>,
            a student of this institution, has maintained good moral character and conduct during his/her stay in this school.</p>
            <p class="mt-6">He/She has not been involved in any disciplinary case that would affect his/her moral character
            and reputation. This student has shown respect to school authorities, faculty members, and fellow students.</p>
            <p class="mt-6">This certification is issued upon the request of the above-mentioned student
            for whatever legal purpose it may serve.</p>
        </div>
        <div class="text-right mt-8 text-lg text-gray-800">
            Issued this ${new Date(certDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}.
        </div>
        <div class="print-signatures-grid">
            ${signatureBlocks[0].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[0].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[0].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[1].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[1].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[1].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[2].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[2].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[2].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[3].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[3].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[3].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
        </div>
      `;
    } else {
      const customText = customCertificateContent ||
        'This is to certify that [STUDENT_NAME] has maintained good moral character during their time at [SCHOOL_NAME].';
      content = `
        ${headerHtml}
        <div class="text-lg text-gray-800 text-justify my-8 leading-relaxed">
            <p>${customText
                .replace(/\[STUDENT_NAME\]/g, `<span class="font-bold underline text-black">${studentName.toUpperCase()}</span>`)
                .replace(/\[SCHOOL_NAME\]/g, school)
                .replace(/\[DATE\]/g, new Date(certDate).toLocaleDateString())
                .replace(/\n/g, '</p><p>')
            }</p>
        </div>
        <div class="text-right mt-8 text-lg text-gray-800">
            Issued this ${new Date(certDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}.
        </div>
        <div class="print-signatures-grid">
            ${signatureBlocks[0].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[0].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[0].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[1].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[1].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[1].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[2].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[2].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[2].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
            ${signatureBlocks[3].name ? `
                <div class="signature-block">
                    <div class="signature-name">${signatureBlocks[3].name.toUpperCase()}</div>
                    <div class="signature-line"></div>
                    <div class="signature-title">${signatureBlocks[3].title}</div>
                </div>
            ` : '<div class="signature-block"></div>'}
        </div>
      `;
    }
    setCertificatePreviewHtml(content);
    if (isPreview) {
      showAlert('Certificate preview generated!', 'success');
    }
  };

  const generateCertificatePDF = async () => {
    if (!previewStudentName) {
      showAlert('Please enter a student name for the certificate.', 'error');
      return;
    }
    await generateCertificateContent(previewStudentName, certificateDate, false);

    try {
      const pdf = new jsPDF();
      let yPosition = 10;

      // Header Logos and Institutional Text
      const logoWidth = 25;
      const logoHeight = 25;
      const leftLogoX = 20;
      const rightLogoX = 190 - logoWidth - 20; // 190 is page width - right margin - logo width

      if (leftHeaderLogoData) {
        try {
          pdf.addImage(leftHeaderLogoData, 'JPEG', leftLogoX, yPosition, logoWidth, logoHeight);
        } catch (e) {
          console.log('Could not add left header logo to PDF');
        }
      }
      if (rightHeaderLogoData) {
        try {
          pdf.addImage(rightHeaderLogoData, 'JPEG', rightLogoX, yPosition, logoWidth, logoHeight);
        } catch (e) {
          console.log('Could not add right header logo to PDF');
        }
      }

      yPosition += 5; // Adjust for text below logos
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('Republic of the Philippines', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Department of Education', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Region VII, Central Visayas', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Division of Cebu City', 105, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(schoolName.toUpperCase(), 105, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(schoolAddress, 105, yPosition, { align: 'center' });
      yPosition += 10; // Space after address

      // Main Certificate Title
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('CERTIFICATE OF GOOD MORAL CHARACTER', 105, yPosition, { align: 'center' });
      yPosition += 25;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('TO WHOM IT MAY CONCERN:', 20, yPosition);
      yPosition += 15;

      let bodyText = '';
      if (certificateTemplate === 'standard') {
        bodyText = `This is to certify that ${previewStudentName.toUpperCase()}, a student of this institution, has maintained good moral character and conduct during his/her stay in this school.
He/She has not been involved in any disciplinary case that would affect his/her moral character and reputation. This student has shown respect to school authorities, faculty members, and fellow students.
This certification is issued upon the request of the above-mentioned student for whatever legal purpose it may serve.`;
      } else {
        bodyText = customCertificateContent
          .replace(/\[STUDENT_NAME\]/g, previewStudentName.toUpperCase())
          .replace(/\[SCHOOL_NAME\]/g, schoolName)
          .replace(/\[DATE\]/g, new Date(certificateDate).toLocaleDateString());
      }

      const lines = pdf.splitTextToSize(bodyText, 170);
      lines.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 15;
      pdf.text(`Issued this ${new Date(certificateDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}.`, 150, yPosition, { align: 'right' });
      yPosition += 40;

      // Signature blocks (2x2 layout)
      const signatureBlocks = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ];

      const blockWidth = 80; // Width for each signature block
      const horizontalSpacing = 30; // Space between left and right blocks
      const verticalSpacing = 25; // Space between rows of signatures

      let currentY = yPosition;

      // Row 1: Guidance Officer and CPC/Guidance Officer
      if (signatureBlocks[0].name || signatureBlocks[1].name) {
        if (currentY > 270) { pdf.addPage(); currentY = 20; }
        
        // Guidance Officer (Left)
        if (signatureBlocks[0].name) {
          const x = 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[0].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[0].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }

        // CPC/Guidance Officer (Right)
        if (signatureBlocks[1].name) {
          const x = 190 - blockWidth - 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[1].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[1].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }
        currentY += verticalSpacing;
      }

      // Row 2: Principal and Assistant Principal
      if (signatureBlocks[2].name || signatureBlocks[3].name) {
        if (currentY > 270) { pdf.addPage(); currentY = 20; }

        // Principal (Left)
        if (signatureBlocks[2].name) {
          const x = 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[2].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[2].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }

        // Assistant Principal (Right)
        if (signatureBlocks[3].name) {
          const x = 190 - blockWidth - 20;
          pdf.setFont(undefined, 'bold');
          pdf.text(signatureBlocks[3].name.toUpperCase(), x + (blockWidth / 2), currentY, { align: 'center' });
          pdf.line(x, currentY + 2, x + blockWidth, currentY + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(signatureBlocks[3].title, x + (blockWidth / 2), currentY + 8, { align: 'center' });
        }
        currentY += verticalSpacing;
      }

      const fileName = `good-moral-certificate-${previewStudentName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('Certificate PDF generated successfully!', 'success');
    } catch (error) {
      console.error('Certificate PDF generation error:', error);
      showAlert('Failed to generate certificate PDF. Please try again.', 'error');
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate Print Preview</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; line-height: 1.6; color: #000; }
              .header-section { display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative; }
              .header-logo { position: absolute; width: 60px; height: 60px; object-fit: contain; top: 0; }
              .left-logo { left: 20px; }
              .right-logo { right: 20px; }
              .text-center { text-align: center; }
              .mb-12 { margin-bottom: 3rem; }
              .border-b-2 { border-bottom-width: 2px; }
              .border-gray-300 { border-color: #d1d5db; }
              .pb-8 { padding-bottom: 2rem; }
              .w-32 { width: 8rem; }
              .h-32 { height: 8rem; }
              .rounded-xl { border-radius: 0.75rem; }
              .object-cover { object-fit: cover; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .mb-4 { margin-bottom: 1rem; }
              .border-2 { border-width: 2px; }
              .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
              .font-bold { font-weight: 700; }
              .uppercase { text-transform: uppercase; }
              .text-gray-900 { color: #111827; }
              .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
              .text-gray-700 { color: #374151; }
              .mt-2 { margin-top: 0.5rem; }
              .text-2xl { font-size: 1.5rem; line-height: 2rem; }
              .tracking-wider { letter-spacing: 0.05em; }
              .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
              .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
              .text-gray-800 { color: #1f2937; }
              .text-justify { text-align: justify; }
              .leading-relaxed { line-height: 1.625; }
              .mt-8 { margin-top: 2rem; }
              .font-bold { font-weight: 700; }
              .underline { text-decoration: underline; }
              .text-black { color: #000; }
              .mt-6 { margin-top: 1.5rem; }
              .text-right { text-align: right; }
              
              .print-signatures-grid { 
                margin-top: 4rem; 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 2rem 4rem; /* row-gap column-gap */
                padding: 0 20mm; /* Match page margins */
                page-break-inside: avoid; 
              }
              .signature-block { text-align: center; }
              .signature-name { font-weight: bold; color: #000; margin-bottom: 0.5rem; font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; }
              .signature-line { border-bottom: 2px solid #000; margin: 0 auto; width: 80%; height: 12px; } /* Adjusted width and height */
              .signature-title { font-weight: 600; color: #000; font-size: 11pt; margin-top: 0.5rem; }
            </style>
          </head>
          <body>
            ${certificatePreviewHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <section id="certificates" className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">📜 Good Moral Certificate</h3>
      <div>
        <Label htmlFor="certificateTemplate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Certificate Template
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'standard' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            onClick={() => {
              setCertificateTemplate('standard');
              db.setSetting('certificateTemplate', 'standard');
            }}
          >
            <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">📄 Standard Template</div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">Professional format with school logo</div>
          </Card>
          <Card
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'custom' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            onClick={() => {
              setCertificateTemplate('custom');
              db.setSetting('certificateTemplate', 'custom');
            }}
          >
            <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">✏️ Custom Template</div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">Editable content and format</div>
          </Card>
        </div>
      </div>

      {certificateTemplate === 'custom' && (
        <div className="mt-6">
          <Label htmlFor="customCertificateContent" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Custom Certificate Content
          </Label>
          <Textarea
            id="customCertificateContent"
            placeholder="Enter your custom certificate content. Use [STUDENT_NAME], [SCHOOL_NAME], and [DATE] as placeholders..."
            value={customCertificateContent}
            onChange={(e) => {
              setCustomCertificateContent(e.target.value);
              db.setSetting('customCertificateContent', e.target.value);
            }}
            className="w-full min-h-[200px]"
          />
        </div>
      )}

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
            onChange={(e) => {
              setCertificateDate(e.target.value);
              db.setSetting('certificateDate', e.target.value);
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <Button onClick={() => generateCertificateContent(previewStudentName, certificateDate, true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
          👁️ Preview Certificate
        </Button>
        <Button variant="success" onClick={generateCertificatePDF} className="px-6 py-3 rounded-lg">
          📜 Generate Certificate
        </Button>
        {certificatePreviewHtml && (
          <Button variant="secondary" onClick={printCertificate} className="px-6 py-3 rounded-lg">
            🖨️ Print Certificate
          </Button>
        )}
      </div>

      {certificatePreviewHtml && (
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Certificate Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: certificatePreviewHtml }} className="prose dark:prose-invert max-w-none" />
        </Card>
      )}
    </section>
  );
};

export default CertificateSection;