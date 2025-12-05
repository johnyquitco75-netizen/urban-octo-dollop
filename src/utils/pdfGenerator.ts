"use client";

import { jsPDF } from 'jspdf';

interface PdfReportData {
  records: any[];
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
  leftHeaderLogoMargin: number; // New prop
  rightHeaderLogoMargin: number; // New prop
}

export const generatePdfReport = ({
  records,
  schoolName,
  schoolAddress,
  leftHeaderLogoData,
  rightHeaderLogoData,
  guidanceOfficer,
  guidanceOfficerPosition,
  cpcGuidanceOfficerName,
  cpcGuidanceOfficerPosition,
  principalName,
  principalPosition,
  assistantPrincipalName,
  assistantPrincipalPosition,
  republicText,
  departmentText,
  regionText,
  divisionText,
  leftHeaderLogoMargin, // Use new prop
  rightHeaderLogoMargin, // Use new prop
}: PdfReportData): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 10; // Initial Y position
      const pageLeftMargin = 20; // Fixed left margin for the page
      const pageRightMargin = 20; // Fixed right margin for the page
      const logoWidth = 25;
      const logoHeight = 25;
      // Convert px to mm for jsPDF (1px = 0.264583mm approx)
      const leftLogoMarginMm = leftHeaderLogoMargin * 0.264583;
      const rightLogoMarginMm = rightHeaderLogoMargin * 0.264583;

      // Calculate logo positions
      const leftLogoX = pageLeftMargin;
      const rightLogoX = pdf.internal.pageSize.getWidth() - pageRightMargin - logoWidth;

      // Add logos
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

      // Calculate the available space for the central text block
      // The text block starts after the left logo (if present) + its margin
      // And ends before the right logo (if present) - its margin
      let currentTextX = pageLeftMargin;
      let maxTextWidth = pdf.internal.pageSize.getWidth() - pageLeftMargin - pageRightMargin;

      if (leftHeaderLogoData) {
        currentTextX += logoWidth + leftLogoMarginMm;
        maxTextWidth -= (logoWidth + leftLogoMarginMm);
      } else {
        // If no left logo, still apply the margin as empty space
        currentTextX += leftLogoMarginMm;
        maxTextWidth -= leftLogoMarginMm;
      }

      if (rightHeaderLogoData) {
        maxTextWidth -= (logoWidth + rightLogoMarginMm);
      } else {
        // If no right logo, still apply the margin as empty space
        maxTextWidth -= rightLogoMarginMm;
      }
      
      // Ensure text block doesn't go negative or too small
      if (maxTextWidth < 0) maxTextWidth = 10; // Minimum width
      if (currentTextX >= pdf.internal.pageSize.getWidth() - pageRightMargin) currentTextX = pageLeftMargin; // Fallback if logos push it too far

      const textBlockCenterX = currentTextX + (maxTextWidth / 2);


      // Center institutional text
      yPosition += 5; // Start text slightly below logos
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
      yPosition += 10; // Space after address

      // Main Report Title
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('E-Guidance Record System Report', textBlockCenterX, yPosition, { align: 'center' });
      yPosition += 15;

      // Total Records count
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${records.length}`, 190, yPosition, { align: 'right' });
      yPosition += 10;

      // Table Headers
      const headers = ['#', 'NAME', 'TYPE', 'GRADE', 'SECTION', 'VIOLATION', 'DATE & TIME', 'DETAILS']; // Added 'SECTION'
      // Adjusted column widths to accommodate DETAILS better
      const colWidths = [10, 25, 15, 15, 20, 25, 30, 50]; // Total 190
      const colPositions = [10];
      for (let i = 0; i < colWidths.length - 1; i++) {
        colPositions.push(colPositions[i] + colWidths[i]);
      }

      pdf.setFillColor(248, 249, 250);
      pdf.rect(10, yPosition, 190, 8, 'F');
      pdf.setFontSize(8); // Smaller font for headers to fit
      pdf.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, colPositions[index] + 2, yPosition + 5);
      });
      pdf.setLineWidth(0.5);
      pdf.rect(10, yPosition, 190, 8);
      yPosition += 8;

      // Table Rows
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(7); // Smaller font for rows to fit
      records.forEach((record, index) => {
        const recordDate = new Date(record.dateTime);
        const formattedDate = recordDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
        const formattedTime = recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const rowData = [
          (index + 1).toString(),
          record.name,
          record.type,
          record.gradeLevel || 'N/A',
          record.gradeSection || 'N/A', // Include Grade Section
          record.violationType,
          `${formattedDate}\n${formattedTime}`,
          record.details || 'N/A'
        ];

        let maxLineHeight = 0;
        const cellLines: string[][] = [];

        // Calculate max height needed for this row
        rowData.forEach((data, colIndex) => {
          const lines = pdf.splitTextToSize(data, colWidths[colIndex] - 4);
          cellLines.push(lines);
          maxLineHeight = Math.max(maxLineHeight, lines.length * 3.5); // Adjusted line height for smaller font
        });

        const calculatedRowHeight = maxLineHeight + 3; // Add some padding

        if (yPosition + calculatedRowHeight > 270) { // Check for page break
          pdf.addPage();
          yPosition = 20; // Reset yPosition for new page
          // Re-add headers on new page
          pdf.setFillColor(248, 249, 250);
          pdf.rect(10, yPosition, 190, 8, 'F');
          pdf.setFontSize(8);
          pdf.setFont(undefined, 'bold');
          headers.forEach((header, idx) => {
            pdf.text(header, colPositions[idx] + 2, yPosition + 5);
          });
          pdf.setLineWidth(0.5);
          pdf.rect(10, yPosition, 190, 8);
          yPosition += 8;
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(7);
        }
        
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(10, yPosition, 190, calculatedRowHeight, 'F');
        }
        cellLines.forEach((lines, colIndex) => {
          lines.forEach((line, lineIndex) => {
            pdf.text(line, colPositions[colIndex] + 2, yPosition + 4 + (lineIndex * 3.5)); // Adjusted text Y position
          });
        });
        yPosition += calculatedRowHeight;
      });

      yPosition += 20; // Space before signatures

      // Signature blocks (2x2 layout) - Replicating certificate layout
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
          const cpcNameX = labelX + 40; // Center name over a block starting at labelX + 10
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('PREPARED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(cpcGuidanceOfficerName.toUpperCase(), cpcNameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(cpcNameX - blockWidth / 2, yPosition + lineYOffset, cpcNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(cpcGuidanceOfficerPosition, cpcNameX, yPosition + positionYOffset, { align: 'center' });
        }

        // Guidance Officer (Right)
        if (guidanceOfficer) {
          const labelX = 120; // Adjusted X for right column
          const guidanceNameX = labelX + 35; // Center name over a block starting at labelX
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(guidanceOfficer.toUpperCase(), guidanceNameX, yPosition + nameLineOffset, { align: 'center' });
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
          const labelX = 20;
          const assistantNameX = labelX + 40;
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('NOTED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(assistantPrincipalName.toUpperCase(), assistantNameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(assistantNameX - blockWidth / 2, yPosition + lineYOffset, assistantNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(assistantPrincipalPosition, assistantNameX, yPosition + positionYOffset, { align: 'center' });
        }

        // APPROVED BY: Principal (Right)
        if (principalName) {
          const labelX = 120;
          const principalNameX = labelX + 35;
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text('APPROVED BY:', labelX, yPosition);
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(principalName.toUpperCase(), principalNameX, yPosition + nameLineOffset, { align: 'center' });
          pdf.line(principalNameX - blockWidth / 2, yPosition + lineYOffset, principalNameX + blockWidth / 2, yPosition + lineYOffset); // Underline
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(principalPosition, principalNameX, yPosition + positionYOffset, { align: 'center' });
        }
        yPosition += rowSpacing; // Move down for next row
      }

      const fileName = `guidance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};