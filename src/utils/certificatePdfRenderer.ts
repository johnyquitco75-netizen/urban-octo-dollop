"use client";

import { jsPDF } from 'jspdf';

interface CertificatePdfData {
  studentName: string;
  certificateDate: string;
  certificateTemplate: string;
  customCertificateContent: string;
  schoolName: string;
  schoolAddress: string;
  leftHeaderLogoData: string | null;
  rightHeaderLogoData: string | null;
  guidanceOfficer: string;
  guidanceOfficerPosition: string;
  cpcGuidanceOfficerName: string;
  cpcGuidanceOfficerPosition: string;
  principalName: string;
  principalPosition: string;
  assistantPrincipalName: string;
  assistantPrincipalPosition: string;
  republicText: string;
  departmentText: string;
  regionText: string;
  divisionText: string;
  hideAllHeaders: boolean; // New prop
}

const leftMargin = 20;
const rightMargin = 20;
const lineHeight = 6; // Standard line height for 12pt font

export const renderCertificateHeader = (pdf: jsPDF, data: CertificatePdfData, yPosition: number): number => {
  const {
    schoolName, schoolAddress,
    leftHeaderLogoData, rightHeaderLogoData,
    republicText, departmentText, regionText, divisionText,
    hideAllHeaders, // Use new prop
  } = data;

  if (hideAllHeaders) {
    // If headers are hidden, just return the current yPosition or a slightly advanced one
    return yPosition + 10; // Add a small buffer for spacing
  }

  const pageLeftMargin = 20; // Fixed left margin for the page
  const pageRightMargin = 20; // Fixed right margin for the page
  const logoWidth = 25;
  const logoHeight = 25;
  const initialY = yPosition;

  // Calculate logo positions
  const leftLogoX = pageLeftMargin;
  const rightLogoX = pdf.internal.pageSize.getWidth() - pageRightMargin - logoWidth;

  // Add logos
  if (leftHeaderLogoData) {
    try {
      pdf.addImage(leftHeaderLogoData, 'JPEG', leftLogoX, initialY, logoWidth, logoHeight);
    } catch (e) {
      console.log('Could not add left header logo to PDF');
    }
  }
  if (rightHeaderLogoData) {
    try {
      pdf.addImage(rightHeaderLogoData, 'JPEG', rightLogoX, initialY, logoWidth, logoHeight);
    } catch (e) {
      console.log('Could not add right header logo to PDF');
    }
  }

  // Calculate the available space for the central text block
  let currentTextX = pageLeftMargin;
  let maxTextWidth = pdf.internal.pageSize.getWidth() - pageLeftMargin - pageRightMargin;

  // Adjust text block position and width based on logo presence
  if (leftHeaderLogoData) {
    currentTextX += logoWidth + 5; // Fixed 5mm margin if logo is present
    maxTextWidth -= (logoWidth + 5);
  }
  if (rightHeaderLogoData) {
    maxTextWidth -= (logoWidth + 5); // Fixed 5mm margin if logo is present
  }
  
  // Ensure text block doesn't go negative or too small
  if (maxTextWidth < 0) maxTextWidth = 10; // Minimum width
  if (currentTextX >= pdf.internal.pageSize.getWidth() - pageRightMargin) currentTextX = pageLeftMargin; // Fallback if logos push it too far

  const textBlockCenterX = currentTextX + (maxTextWidth / 2);

  // Institutional text (centered)
  yPosition = initialY + 5; // Start text slightly below logos
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(republicText, textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(departmentText, textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(regionText, textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(divisionText, textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 6;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text(schoolName.toUpperCase(), textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 5;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(schoolAddress, textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 15; // Space after address

  // Main Certificate Title (centered)
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('CERTIFICATE OF GOOD MORAL CHARACTER', textBlockCenterX, yPosition, { align: 'center' });
  yPosition += 25;

  return yPosition;
};

export const renderCertificateBody = (pdf: jsPDF, data: CertificatePdfData, yPosition: number): number => {
  const { studentName, certificateDate, certificateTemplate, customCertificateContent, schoolName } = data;
  const contentWidth = pdf.internal.pageSize.getWidth() - leftMargin - rightMargin;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text('TO WHOM IT MAY CONCERN:', leftMargin, yPosition);
  yPosition += 15;

  if (certificateTemplate === 'standard') {
    // Paragraph 1: "This is to certify that [STUDENT_NAME], a student..."
    const p1_prefix = "This is to certify that ";
    const p1_studentNameAndComma = studentName.toUpperCase() + ',';
    const p1_suffix_text = "a student of this institution, has maintained good moral character and conduct during his/her stay in this school.";

    let currentX = leftMargin;

    // Print prefix (normal font)
    pdf.setFont(undefined, 'normal');
    pdf.text(p1_prefix, currentX, yPosition);
    currentX += pdf.getStringUnitWidth(p1_prefix) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;

    // Print student name and comma (bold and underlined)
    pdf.setFont(undefined, 'bold');
    pdf.text(p1_studentNameAndComma, currentX, yPosition);
    const studentNameWidth = pdf.getStringUnitWidth(p1_studentNameAndComma) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    pdf.line(currentX, yPosition + 1.5, currentX + studentNameWidth, yPosition + 1.5);
    currentX += studentNameWidth;

    // Now handle the rest of the sentence (normal font)
    pdf.setFont(undefined, 'normal');
    const fullSentenceAfterName = ' ' + p1_suffix_text; // Add the space here

    const remainingWidthForFirstLine = pdf.internal.pageSize.getWidth() - currentX - rightMargin;

    // Split the remaining text. The first part uses remaining width, subsequent parts use full content width.
    const lines = pdf.splitTextToSize(fullSentenceAfterName, remainingWidthForFirstLine);

    if (lines.length > 0) {
        pdf.text(lines[0], currentX, yPosition); // Print the first part on the current line
        yPosition += lineHeight;

        // Print any subsequent lines of the suffix on new lines, full width
        for (let i = 1; i < lines.length; i++) {
            pdf.text(lines[i], leftMargin, yPosition);
            yPosition += lineHeight;
        }
    } else {
        yPosition += lineHeight; // Just move yPosition if there's no suffix text
    }
    yPosition += 6; // Extra space after first paragraph

    // Paragraph 2: "He/She has not been involved..." (Normal font, no bold, no underline)
    const p2 = "He/She has not been involved in any disciplinary case that would affect his/her moral character and reputation. This student has shown respect to school authorities, faculty members, and fellow students.";
    const p2_lines = pdf.splitTextToSize(p2, contentWidth);

    pdf.setFont(undefined, 'normal'); // Ensure normal font
    p2_lines.forEach(line => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 6; // Extra space after second paragraph

    // Paragraph 3: "This certification is issued..." (Normal font)
    const p3 = "This certification is issued upon the request of the above-mentioned student for whatever legal purpose it may serve.";
    const p3_lines = pdf.splitTextToSize(p3, contentWidth);
    p3_lines.forEach(line => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 15; // Space before date

  } else {
    // Custom template
    const bodyText = customCertificateContent
      .replace(/\[STUDENT_NAME\]/g, studentName.toUpperCase() + ',')
      .replace(/\[SCHOOL_NAME\]/g, schoolName)
      .replace(/\[DATE\]/g, new Date(certificateDate).toLocaleDateString());

    const lines = pdf.splitTextToSize(bodyText, contentWidth);
    lines.forEach(line => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += 6;
    });
    yPosition += 15;
  }

  pdf.text(`Issued this ${new Date(certificateDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}.`, pdf.internal.pageSize.getWidth() - rightMargin, yPosition, { align: 'right' });
  yPosition += 40;

  return yPosition;
};

export const renderCertificateSignatures = (pdf: jsPDF, data: CertificatePdfData, yPosition: number): number => {
  const {
    guidanceOfficer, guidanceOfficerPosition,
    cpcGuidanceOfficerName, cpcGuidanceOfficerPosition,
    principalName, principalPosition,
    assistantPrincipalName, assistantPrincipalPosition,
  } = data;

  const pageCenterX = pdf.internal.pageSize.getWidth() / 2;
  const blockStartXLeft = leftMargin;
  const blockStartXRight = pageCenterX + 15; // Adjusted for spacing
  const blockWidth = 75; // Width for each signature block
  const nameYOffset = 10; // Y offset for name from label
  const lineYOffset = 12; // Y offset for underline from label
  const positionYOffset = 17; // Y offset for position from label
  const rowSpacing = 35; // Vertical space between rows of signatures

  // Row 1: PREPARED BY (CPC/Guidance Officer) and Guidance Officer
  if (cpcGuidanceOfficerName || guidanceOfficer) {
    if (yPosition > 270) { pdf.addPage(); yPosition = 20; }
    
    // PREPARED BY: CPC/Guidance Officer (Left)
    if (cpcGuidanceOfficerName) {
      const cpcNameX = blockStartXLeft + blockWidth / 2; // Define nameX for CPC
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('PREPARED BY:', blockStartXLeft, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(cpcGuidanceOfficerName.toUpperCase(), cpcNameX, yPosition + nameYOffset, { align: 'center' });
      pdf.line(cpcNameX - blockWidth / 2, yPosition + lineYOffset, cpcNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(cpcGuidanceOfficerPosition, cpcNameX, yPosition + positionYOffset, { align: 'center' });
    }

    // Guidance Officer (Right)
    if (guidanceOfficer) {
      const guidanceNameX = blockStartXRight + blockWidth / 2; // Define nameX for Guidance Officer
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(guidanceOfficer.toUpperCase(), guidanceNameX, yPosition + nameYOffset, { align: 'center' });
      pdf.line(guidanceNameX - blockWidth / 2, yPosition + lineYOffset, guidanceNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(guidanceOfficerPosition, guidanceNameX, yPosition + positionYOffset, { align: 'center' });
    }
    yPosition += rowSpacing; // Move down for next row
  }

  // Row 2: NOTED BY (Assistant Principal) and APPROVED BY (Principal)
  if (assistantPrincipalName || principalName) {
    if (yPosition > 270) { pdf.addPage(); yPosition = 20; }

    // NOTED BY: Assistant Principal (Left)
    if (assistantPrincipalName) {
      const assistantNameX = blockStartXLeft + blockWidth / 2; // Define nameX for Assistant Principal
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('NOTED BY:', blockStartXLeft, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(assistantPrincipalName.toUpperCase(), assistantNameX, yPosition + nameYOffset, { align: 'center' });
      pdf.line(assistantNameX - blockWidth / 2, yPosition + lineYOffset, assistantNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(assistantPrincipalPosition, assistantNameX, yPosition + positionYOffset, { align: 'center' });
    }

    // APPROVED BY: Principal (Right)
    if (principalName) {
      const principalNameX = blockStartXRight + blockWidth / 2; // Define nameX for Principal
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('APPROVED BY:', blockStartXRight, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(principalName.toUpperCase(), principalNameX, yPosition + nameYOffset, { align: 'center' });
      pdf.line(principalNameX - blockWidth / 2, yPosition + lineYOffset, principalNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(principalPosition, principalNameX, yPosition + positionYOffset, { align: 'center' });
    }
    yPosition += rowSpacing; // Move down for next row
  }

  return yPosition;
};