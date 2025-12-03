"use client";

import React, { useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { jsPDF } from 'jspdf';

interface UseCertificateGeneratorProps {
  certificateTemplate: string;
  customCertificateContent: string;
  previewStudentName: string;
  certificateDate: string;
}

export const useCertificateGenerator = ({
  certificateTemplate,
  customCertificateContent,
  previewStudentName,
  certificateDate,
}: UseCertificateGeneratorProps) => {
  const {
    showAlert,
    schoolName, schoolAddress,
    leftHeaderLogoData, rightHeaderLogoData,
    guidanceOfficer, guidanceOfficerPosition,
    cpcGuidanceOfficerName, cpcGuidanceOfficerPosition,
    principalName, principalPosition,
    assistantPrincipalName, assistantPrincipalPosition,
    republicText, departmentText, regionText, divisionText
  } = useAppContext();

  const [certificatePreviewHtml, setCertificatePreviewHtml] = useState<string | null>(null);

  const generateCertificateContent = useCallback(async (studentName: string, certDate: string, isPreview = false) => {
    const school = schoolName;
    const address = schoolAddress;
    const leftLogo = leftHeaderLogoData;
    const rightLogo = rightHeaderLogoData;
    const guidance = guidanceOfficer;
    const guidancePos = guidanceOfficerPosition;
    const cpc = cpcGuidanceOfficerName;
    const cpcPos = cpcGuidanceOfficerPosition;
    const principal = principalName;
    const principalPos = principalPosition;
    const assistant = assistantPrincipalName;
    const assistantPos = assistantPrincipalPosition;

    const headerHtml = `
      <div class="header-section" style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 20px; position: relative;">
          ${leftLogo ? `<img src="${leftLogo}" class="header-logo left-logo" alt="Left Logo">` : ''}
          <div class="text-center" style="flex-grow: 1;">
              <p style="margin: 0; font-size: 10pt;">${republicText}</p>
              <p style="margin: 0; font-size: 10pt;">${departmentText}</p>
              <p style="margin: 0; font-size: 10pt;">${regionText}</p>
              <p style="margin: 0; font-size: 10pt;">${divisionText}</p>
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
            <p class="mt-8">This is to certify that <span class="font-bold underline text-black">${studentName.toUpperCase()},</span>
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
            <div class="signature-row">
                <div class="signature-col">
                    ${cpc ? `
                        <div class="signature-label">PREPARED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${cpc.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${cpcPos}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="signature-col">
                    ${guidance ? `
                        <div class="signature-block">
                            <div class="signature-name">${guidance.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${guidancePos}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="signature-row mt-8">
                <div class="signature-col">
                    ${assistant ? `
                        <div class="signature-label">NOTED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${assistant.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${assistantPos}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="signature-col">
                    ${principal ? `
                        <div class="signature-label">APPROVED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${principal.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${principalPos}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
      `;
    } else {
      const customText = customCertificateContent ||
        'This is to certify that [STUDENT_NAME] has maintained good moral character during their time at [SCHOOL_NAME].';
      content = `
        ${headerHtml}
        <div class="text-lg text-gray-800 text-justify my-8 leading-relaxed">
            <p>${customText
                .replace(/\[STUDENT_NAME\]/g, `<span class="font-bold underline text-black">${studentName.toUpperCase()},</span>`)
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
            <div class="signature-row">
                <div class="signature-col">
                    ${cpc ? `
                        <div class="signature-label">PREPARED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${cpc.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${cpcPos}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="signature-col">
                    ${guidance ? `
                        <div class="signature-block">
                            <div class="signature-name">${guidance.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${guidancePos}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="signature-row mt-8">
                <div class="signature-col">
                    ${assistant ? `
                        <div class="signature-label">NOTED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${assistant.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${assistantPos}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="signature-col">
                    ${principal ? `
                        <div class="signature-label">APPROVED BY:</div>
                        <div class="signature-block">
                            <div class="signature-name">${principal.toUpperCase()}</div>
                            <div class="signature-line"></div>
                            <div class="signature-title">${principalPos}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
      `;
    }
    setCertificatePreviewHtml(content);
    if (isPreview) {
      showAlert('Certificate preview generated!', 'success');
    }
  }, [certificateTemplate, customCertificateContent, schoolName, schoolAddress, leftHeaderLogoData, rightHeaderLogoData, guidanceOfficer, guidanceOfficerPosition, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, principalName, principalPosition, assistantPrincipalName, assistantPrincipalPosition, republicText, departmentText, regionText, divisionText, showAlert]);

  const generateCertificatePDF = useCallback(async () => {
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
      pdf.text(republicText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(departmentText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(regionText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text(divisionText, 105, yPosition, { align: 'center' });
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

      const lineHeight = 6; // Standard line height for 12pt font

      if (certificateTemplate === 'standard') {
        // Paragraph 1: "This is to certify that [STUDENT_NAME], a student..."
        const p1_prefix = "This is to certify that ";
        const p1_studentNameAndCommaText = previewStudentName.toUpperCase() + ','; // Include comma with name
        const p1_suffix_rest = " a student of this institution, has maintained good moral character and conduct during his/her stay in this school."; // Starts with space

        let currentX = 20;

        // Print prefix
        pdf.text(p1_prefix, currentX, yPosition);
        currentX += pdf.getStringUnitWidth(p1_prefix) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;

        // Print student name and comma (bold and underlined)
        pdf.setFont(undefined, 'bold');
        pdf.text(p1_studentNameAndCommaText, currentX, yPosition);
        const studentNameAndCommaWidth = pdf.getStringUnitWidth(p1_studentNameAndCommaText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
        // Draw underline slightly below the text baseline
        pdf.line(currentX, yPosition + 1.5, currentX + studentNameAndCommaWidth, yPosition + 1.5);
        currentX += studentNameAndCommaWidth;

        // Print the rest of the suffix
        pdf.setFont(undefined, 'normal');
        const remainingWidthForSuffix = pdf.internal.pageSize.getWidth() - currentX - 20; // 20 for right margin

        if (pdf.getStringUnitWidth(p1_suffix_rest) * pdf.internal.getFontSize() / pdf.internal.scaleFactor <= remainingWidthForSuffix) {
          // Suffix fits on the current line
          pdf.text(p1_suffix_rest, currentX, yPosition);
          yPosition += lineHeight; // Move to next line after this sentence
        } else {
          // Suffix needs to wrap, move to next line for the entire suffix
          yPosition += lineHeight; // Move to next line
          const suffixLines = pdf.splitTextToSize(p1_suffix_rest, 170); // Max width for full lines
          suffixLines.forEach(line => {
            pdf.text(line, 20, yPosition);
            yPosition += lineHeight;
          });
        }
        yPosition += 6; // Extra space after first paragraph

        // Paragraph 2: "He/She has not been involved..."
        const p2 = "He/She has not been involved in any disciplinary case that would affect his/her moral character and reputation. This student has shown respect to school authorities, faculty members, and fellow students.";
        const p2_lines = pdf.splitTextToSize(p2, 170);
        p2_lines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 6; // Extra space after second paragraph

        // Paragraph 3: "This certification is issued..."
        const p3 = "This certification is issued upon the request of the above-mentioned student for whatever legal purpose it may serve.";
        const p3_lines = pdf.splitTextToSize(p3, 170);
        p3_lines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 15; // Space before date

      } else {
        // Custom template: [STUDENT_NAME] will be replaced but not underlined in PDF due to jsPDF limitations.
        const bodyText = customCertificateContent
          .replace(/\[STUDENT_NAME\]/g, previewStudentName.toUpperCase() + ',') // Also add comma here for consistency
          .replace(/\[SCHOOL_NAME\]/g, schoolName)
          .replace(/\[DATE\]/g, new Date(certificateDate).toLocaleDateString());

        const lines = pdf.splitTextToSize(bodyText, 170);
        lines.forEach(line => {
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 15;
      }

      pdf.text(`Issued this ${new Date(certificateDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}.`, 150, yPosition, { align: 'right' });
      yPosition += 40;

      // Signature blocks (2x2 layout)
      const blockWidth = 70; // Width for each signature block
      const nameLineOffset = 10; // Y offset for name from label
      const lineYOffset = 12; // Y offset for underline from label
      const positionYOffset = 17; // Y offset for position from label
      const rowSpacing = 35; // Vertical space between rows of signatures

      // Row 1: PREPARED BY (CPC/Guidance Officer) and Guidance Officer
      if (cpcGuidanceOfficerName || guidanceOfficer) {
        if (yPosition > 270) { pdf.addPage(); yPosition = 20; }
        
        // PREPARED BY: CPC/Guidance Officer (Left)
        if (cpcGuidanceOfficerName) {
          const labelX = 20;
          const nameX = labelX + 40; // Center name over a block starting at labelX + 10
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('PREPARED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(cpcGuidanceOfficerName.toUpperCase(), nameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(nameX - blockWidth / 2, yPosition + lineYOffset, nameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(cpcGuidanceOfficerPosition, nameX, yPosition + positionYOffset, { align: 'center' });
        }

        // Guidance Officer (Right)
        if (guidanceOfficer) {
          const labelX = 120; // Adjusted X for right column
          const nameX = labelX + 35; // Center name over a block starting at labelX
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(guidanceOfficer.toUpperCase(), nameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(nameX - blockWidth / 2, yPosition + lineYOffset, nameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(guidanceOfficerPosition, nameX, yPosition + positionYOffset, { align: 'center' });
        }
        yPosition += rowSpacing; // Move down for next row
      }

      // Row 2: NOTED BY (Assistant Principal) and APPROVED BY (Principal)
      if (assistantPrincipalName || principalName) {
        if (yPosition > 270) { pdf.addPage(); yPosition = 20; }

        // NOTED BY: Assistant Principal (Left)
        if (assistantPrincipalName) {
          const labelX = 20;
          const nameX = labelX + 40;
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('NOTED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(assistantPrincipalName.toUpperCase(), nameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(nameX - blockWidth / 2, yPosition + lineYOffset, nameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(assistantPrincipalPosition, nameX, yPosition + positionYOffset, { align: 'center' });
        }

        // APPROVED BY: Principal (Right)
        if (principalName) {
          const labelX = 120;
          const nameX = labelX + 35;
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('APPROVED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(principalName.toUpperCase(), nameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(nameX - blockWidth / 2, yPosition + lineYOffset, nameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(principalPosition, nameX, yPosition + positionYOffset, { align: 'center' });
        }
        yPosition += rowSpacing; // Move down for next row
      }

      const fileName = `good-moral-certificate-${previewStudentName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('Certificate PDF generated successfully!', 'success');
    } catch (error) {
      console.error('Certificate PDF generation error:', error);
      showAlert('Failed to generate certificate PDF. Please try again.', 'error');
    }
  }, [previewStudentName, certificateDate, generateCertificateContent, leftHeaderLogoData, rightHeaderLogoData, republicText, departmentText, regionText, divisionText, schoolName, schoolAddress, cpcGuidanceOfficerName, cpcGuidanceOfficerPosition, guidanceOfficer, guidanceOfficerPosition, assistantPrincipalName, assistantPrincipalPosition, principalName, principalPosition, customCertificateContent, certificateTemplate, showAlert]);

  const printCertificate = useCallback(() => {
    if (!certificatePreviewHtml) {
      showAlert('Please generate a preview first.', 'error');
      return;
    }
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
                display: flex; 
                flex-direction: column;
                gap: 2rem; /* Space between rows of signatures */
                padding: 0 20mm; 
                page-break-inside: avoid; 
              }
              .signature-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 4rem; /* Space between left and right columns */
              }
              .signature-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-start; /* Align label to start */
              }
              .signature-label { 
                font-weight: normal; 
                color: #000; 
                font-size: 9pt; 
                text-align: left; 
                margin-bottom: 0.2rem; 
                width: 100%; /* Ensure label takes full width for alignment */
              }
              .signature-block { 
                text-align: center; 
                flex-shrink: 0; 
                width: 100%; /* Ensure block takes full width for centering */
                margin-top: 0.5rem; /* Space between label and name */
              } 
              .signature-name { 
                font-weight: bold; 
                color: #000; 
                margin-bottom: 0.5rem; 
                font-size: 11pt; 
                text-transform: uppercase; 
                letter-spacing: 1px; 
                display: block; /* Ensure it's a block for centering */
              }
              .signature-line { 
                border-bottom: 1px solid #000; 
                margin: 0 auto; 
                width: 80%; /* Adjust width of underline */
                height: 12px; 
                display: block; /* Ensure it's a block for centering */
              }
              .signature-title { 
                font-weight: normal; 
                color: #000; 
                font-size: 9pt; 
                margin-top: 0.5rem; 
                display: block; /* Ensure it's a block for centering */
              }
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
  }, [certificatePreviewHtml, showAlert]);

  return {
    certificatePreviewHtml,
    generateCertificateContent,
    generateCertificatePDF,
    printCertificate,
  };
};