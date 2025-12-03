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
}

const leftMargin = 20;
const rightMargin = 20;
const lineHeight = 6; // Standard line height for 12pt font

export const renderCertificateHeader = (pdf: jsPDF, data: CertificatePdfData, yPosition: number): number => {
  const {
    schoolName, schoolAddress,
    leftHeaderLogoData, rightHeaderLogoData,
    republicText, departmentText, regionText, divisionText
  } = data;

  const pageCenterX = pdf.internal.pageSize.getWidth() / 2;
  const logoWidth = 25;
  const logoHeight = 25;
  const logoY = yPosition;

  // Left Logo
  if (leftHeaderLogoData) {
    try {
      pdf.addImage(leftHeaderLogoData, 'JPEG', leftMargin, logoY, logoWidth, logoHeight);
    } catch (e) {
      console.log('Could not add left header logo to PDF');
    }
  }
  // Right Logo
  if (rightHeaderLogoData) {
    try {
      pdf.addImage(rightHeaderLogoData, 'JPEG', pdf.internal.pageSize.getWidth() - rightMargin - logoWidth, logoY, logoWidth, logoHeight);
    } catch (e) {
      console.log('Could not add right header logo to PDF');
    }
  }

  // Institutional text (centered)
  yPosition = logoY + 5; // Start text slightly below logos
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(republicText, pageCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(departmentText, pageCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(regionText, pageCenterX, yPosition, { align: 'center' });
  yPosition += 4;
  pdf.text(divisionText, pageCenterX, yPosition, { align: 'center' });
  yPosition += 6;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text(schoolName.toUpperCase(), pageCenterX, yPosition, { align: 'center' });
  yPosition += 5;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(schoolAddress, pageCenterX, yPosition, { align: 'center' });
  yPosition += 15; // Space after address

  // Main Certificate Title (centered)
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('CERTIFICATE OF GOOD MORAL CHARACTER', pageCenterX, yPosition, { align: 'center' });
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
    const p1_studentNameAndCommaText = studentName.toUpperCase() + ',';
    const p1_suffix_rest = " a student of this institution, has maintained good moral character and conduct during his/her stay in this school.";

    let currentX = leftMargin;

    // Print prefix
    pdf.text(p1_prefix, currentX, yPosition);
    currentX += pdf.getStringUnitWidth(p1_prefix) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;

    // Print student name and comma (bold and underlined)
    pdf.setFont(undefined, 'bold');
    pdf.text(p1_studentNameAndCommaText, currentX, yPosition);
    const studentNameAndCommaWidth = pdf.getStringUnitWidth(p1_studentNameAndCommaText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    pdf.line(currentX, yPosition + 1.5, currentX + studentNameAndCommaWidth, yPosition + 1.5);
    currentX += studentNameAndCommaWidth;

    // Print the rest of the suffix
    pdf.setFont(undefined, 'normal');
    const remainingWidthForSuffix = pdf.internal.pageSize.getWidth() - currentX - rightMargin;

    if (pdf.getStringUnitWidth(p1_suffix_rest) * pdf.internal.getFontSize() / pdf.internal.scaleFactor <= remainingWidthForSuffix) {
      pdf.text(p1_suffix_rest, currentX, yPosition);
      yPosition += lineHeight;
    } else {
      yPosition += lineHeight;
      const suffixLines = pdf.splitTextToSize(p1_suffix_rest, contentWidth);
      suffixLines.forEach(line => {
        pdf.text(line, leftMargin, yPosition);
        yPosition += lineHeight;
      });
    }
    yPosition += 6;

    // Paragraph 2: "He/She has not been involved..."
    const p2 = "He/She has not been involved in any disciplinary case that would affect his/her moral character and reputation. This student has shown respect to school authorities, faculty members, and fellow students.";
    const p2_lines = pdf.splitTextToSize(p2, contentWidth);
    p2_lines.forEach(line => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 6;

    // Paragraph 3: "This certification is issued..."
    const p3 = "This certification is issued upon the request of the above-mentioned student for whatever legal purpose it may serve.";
    const p3_lines = pdf.splitTextToSize(p3, contentWidth);
    p3_lines.forEach(line => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 15;

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
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('PREPARED BY:', blockStartXLeft, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(cpcGuidanceOfficerName.toUpperCase(), blockStartXLeft + blockWidth / 2, yPosition + nameYOffset, { align: 'center' });
      pdf.line(blockStartXLeft, yPosition + lineYOffset, blockStartXLeft + blockWidth, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(cpcGuidanceOfficerPosition, blockStartXLeft + blockWidth / 2, yPosition + positionYOffset, { align: 'center' });
    }

    // Guidance Officer (Right)
    if (guidanceOfficer) {
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(guidanceOfficer.toUpperCase(), blockStartXRight + blockWidth / 2, yPosition + nameYOffset, { align: 'center' });
      pdf.line(blockStartXRight, yPosition + lineYOffset, blockStartXRight + blockWidth, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(guidanceOfficerPosition, blockStartXRight + blockWidth / 2, yPosition + positionYOffset, { align: 'center' });
    }
    yPosition += rowSpacing; // Move down for next row
  }

  // Row 2: NOTED BY (Assistant Principal) and APPROVED BY (Principal)
  if (assistantPrincipalName || principalName) {
    if (yPosition > 270) { pdf.addPage(); yPosition = 20; }

    // NOTED BY: Assistant Principal (Left)
    if (assistantPrincipalName) {
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('NOTED BY:', blockStartXLeft, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(assistantPrincipalName.toUpperCase(), blockStartXLeft + blockWidth / 2, yPosition + nameYOffset, { align: 'center' });
      pdf.line(blockStartXLeft, yPosition + lineYOffset, blockStartXLeft + blockWidth, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(assistantPrincipalPosition, blockStartXLeft + blockWidth / 2, yPosition + positionYOffset, { align: 'center' });
    }

    // APPROVED BY: Principal (Right)
    if (principalName) {
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('APPROVED BY:', blockStartXRight, yPosition);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(principalName.toUpperCase(), blockStartXRight + blockWidth / 2, yPosition + nameYOffset, { align: 'center' });
      pdf.line(blockStartXRight, yPosition + lineYOffset, blockStartXRight + blockWidth, yPosition + lineYOffset); // Underline
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(principalPosition, blockStartXRight + blockWidth / 2, yPosition + positionYOffset, { align: 'center' });
    }
    yPosition += rowSpacing; // Move down for next row
  }

  return yPosition;
};