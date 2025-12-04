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
}: PdfReportData): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 10; // Initial Y position
      const pageCenterX = pdf.internal.pageSize.getWidth() / 2;

      // Header Logos and Institutional Text
      const logoWidth = 25;
      const logoHeight = 25;
      const logoPadding = 5; // Padding between logo and text block (e.g., 5mm)

      // Calculate max width of the central text block
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const textLinesForWidthCalc = [ // Use a temporary array for width calculation
        republicText,
        departmentText,
        regionText,
        divisionText,
        schoolAddress
      ];
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      textLinesForWidthCalc.push(schoolName.toUpperCase());

      let actualTextWidth = 0;
      const scaleFactor = pdf.internal.scaleFactor;
      textLinesForWidthCalc.forEach(line => {
        actualTextWidth = Math.max(actualTextWidth, pdf.getStringUnitWidth(line) * pdf.internal.getFontSize() / scaleFactor);
      });

      const minCentralTextWidth = 100; // Minimum width for the central text block (e.g., 100mm)
      const effectiveCentralTextWidth = Math.max(actualTextWidth, minCentralTextWidth);

      const centralTextBlockStartX = pageCenterX - (effectiveCentralTextWidth / 2);
      const centralTextBlockEndX = pageCenterX + (effectiveCentralTextWidth / 2);

      const leftLogoX = centralTextBlockStartX - logoWidth - logoPadding;
      const rightLogoX = centralTextBlockEndX + logoPadding;

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

      // Center institutional text
      yPosition += 5; // Start text slightly below logos
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
      yPosition += 10; // Space after address

      // Main Report Title
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('E-Guidance Record System Report', pageCenterX, yPosition, { align: 'center' });
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

      const fileName = `guidance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};