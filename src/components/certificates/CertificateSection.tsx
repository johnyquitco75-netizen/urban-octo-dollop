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

    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftLogo ? `<img src="${leftLogo}" class="header-logo left-logo" style="position: absolute; left: 20px; top: 0; width: 60px; height: 60px; object-fit: contain;" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <p style="margin: 0; font-size: 10pt;">Republic of the Philippines</p>
              <p style="margin: 0; font-size: 10pt;">Department of Education</p>
              <p style="margin: 0; font-size: 10pt;">Region VII, Central Visayas</p>
              <p style="margin: 0; font-size: 10pt;">Division of Cebu City</p>
              <p style="margin: 0; font-size: 12pt; font-weight: bold; margin-top: 5px;">${school.toUpperCase()}</p>
              <p style="margin: 0; font-size: 10pt;">${address}</p>
          </div>
          ${rightLogo ? `<img src="${rightLogo}" class="header-logo right-logo" style="position: absolute; right: 20px; top: 0; width: 60px; height: 60px; object-fit: contain;" alt="Right Logo">` : ''}
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
        <div class="flex justify-around mt-16 gap-8 px-8 print:flex-wrap print:gap-8">
            ${guidance ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidance.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
                </div>
            ` : ''}
            ${cpc ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpc.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
                </div>
            ` : ''}
            ${principal ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principal.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Principal</div>
                </div>
            ` : ''}
            ${assistant ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistant.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
                </div>
            ` : ''}
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
        <div class="flex justify-around mt-16 gap-8 px-8 print:flex-wrap print:gap-8">
            ${guidance ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidance.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
                </div>
            ` : ''}
            ${cpc ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpc.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
                </div>
            ` : ''}
            ${principal ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principal.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Principal</div>
                </div>
            ` : ''}
            ${assistant ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistant.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
                </div>
            ` : ''}
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

      // Header Logos and Text
      if (leftHeaderLogoData) {
        try {
          pdf.addImage(leftHeaderLogoData, 'JPEG', 20, yPosition, 25, 25); // Left logo
        } catch (e) {
          console.log('Could not add left header logo to PDF');
        }
      }
      if (rightHeaderLogoData) {
        try {
          pdf.addImage(rightHeaderLogoData, 'JPEG', 165, yPosition, 25, 25); // Right logo
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
      yPosition += 10;
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

      // Signature blocks
      const signatureBlocks = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ].filter(officer => officer.name); // Only show if name is provided

      const numSignatures = signatureBlocks.length;
      const blockWidth = 60; // Width for each signature block
      const spacing = (190 - (numSignatures * blockWidth)) / (numSignatures + 1); // Distribute evenly

      let currentX = 10 + spacing;

      signatureBlocks.forEach((officer, index) => {
        if (yPosition > 270) { // Check for page break before signatures
          pdf.addPage();
          yPosition = 20;
          currentX = 10 + spacing; // Reset X position for new page
        }

        pdf.setFont(undefined, 'bold');
        pdf.text(officer.name.toUpperCase(), currentX + (blockWidth / 2), yPosition, { align: 'center' });
        pdf.line(currentX, yPosition + 2, currentX + blockWidth, yPosition + 2);
        pdf.setFont(undefined, 'normal');
        pdf.text(officer.title, currentX + (blockWidth / 2), yPosition + 8, { align: 'center' });

        currentX += blockWidth + spacing;
      });

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
              .header-logo { position: absolute; width: 60px; height: 60px; object-fit: contain; }
              .left-logo { left: 20px; top: 0; }
              .right-logo { right: 20px; top: 0; }
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
              .mt-16 { margin-top: 4rem; }
              .flex { display: flex; }
              .justify-around { justify-content: space-around; } /* Changed from justify-between */
              .gap-16 { gap: 4rem; }
              .px-8 { padding-left: 2rem; padding-right: 2rem; }
              .flex-1 { flex: 1 1 0%; }
              .min-w-\[200px\] { min-width: 200px; }
              .tracking-wide { letter-spacing: 0.025em; }
              .mb-2 { margin-bottom: 0.5rem; }
              .border-b-2 { border-bottom-width: 2px; }
              .h-12 { height: 3rem; }
              .w-full { width: 100%; }
              .font-semibold { font-weight: 600; }
              .mt-2 { margin-top: 0.5rem; }
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