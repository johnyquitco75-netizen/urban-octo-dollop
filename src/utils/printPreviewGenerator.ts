"use client";

interface PrintPreviewData {
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

export const generatePrintPreviewHtml = ({
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
}: PrintPreviewData): string => {
  const headerHtml = `
    <div class="header-container" style="display: flex; justify-content: center; margin-bottom: 20px;">
        <div class="header-content" style="display: flex; align-items: center; width: 100%; max-width: 800px;">
            ${leftHeaderLogoData ? `<img src="${leftHeaderLogoData}" class="header-logo" alt="Left Logo" style="width: 60px; height: 60px; object-fit: contain; margin-right: ${leftHeaderLogoMargin}px; flex-shrink: 0;">` : `<div style="width: ${leftHeaderLogoMargin}px; flex-shrink: 0;"></div>`}
            <div class="text-center" style="flex-grow: 1; text-align: center;">
                <p style="margin: 0; font-size: 10pt;">${republicText}</p>
                <p style="margin: 0; font-size: 10pt;">${departmentText}</p>
                <p style="margin: 0; font-size: 10pt;">${regionText}</p>
                <p style="margin: 0; font-size: 10pt;">${divisionText}</p>
                <p style="margin: 0; font-size: 12pt; font-weight: bold; margin-top: 5px;">${schoolName.toUpperCase()}</p>
                <p style="margin: 0; font-size: 10pt;">${schoolAddress}</p>
            </div>
            ${rightHeaderLogoData ? `<img src="${rightHeaderLogoData}" class="header-logo" alt="Right Logo" style="width: 60px; height: 60px; object-fit: contain; margin-left: ${rightHeaderLogoMargin}px; flex-shrink: 0;">` : `<div style="width: ${rightHeaderLogoMargin}px; flex-shrink: 0;"></div>`}
        </div>
    </div>
    <div class="text-center mb-8">
        <h2 class="text-xl font-bold text-gray-900 mt-4">E-Guidance Record System Report</h2>
        <div class="text-lg text-gray-600 mt-4 text-right" style="padding-right: 20px;">Total Records: ${records.length}</div>
    </div>
  `;

  const content = `
    ${headerHtml}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse mt-4 bg-white rounded-lg shadow-sm">
          <thead>
              <tr class="bg-gray-100 text-gray-700 text-sm uppercase font-semibold tracking-wider">
                  <th class="py-3 px-4 text-left">#</th>
                  <th class="py-3 px-4 text-left">NAME</th>
                  <th class="py-3 px-4 text-left">TYPE</th>
                  <th class="py-3 px-4 text-left">GRADE</th>
                  <th class="py-3 px-4 text-left">SECTION</th>
                  <th class="py-3 px-4 text-left">VIOLATION</th>
                  <th class="py-3 px-4 text-left">DATE & TIME</th>
                  <th class="py-3 px-4 text-left">DETAILS</th>
              </tr>
          </thead>
          <tbody>
              ${records.map((record, index) => `
                  <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="py-3 px-4">${index + 1}</td>
                      <td class="py-3 px-4 font-medium text-gray-800">${record.name}</td>
                      <td class="py-3 px-4"><span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${record.type}</span></td>
                      <td class="py-3 px-4">${record.gradeLevel || 'N/A'}</td>
                      <td class="py-3 px-4">${record.gradeSection || 'N/A'}</td>
                      <td class="py-3 px-4">${record.violationType}</td>
                      <td class="py-3 px-4">
                          ${new Date(record.dateTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}<br>
                          ${new Date(record.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td class="py-3 px-4 text-gray-600" style="white-space: normal;">${record.details || 'N/A'}</td>
                  </tr>
              `).join('')}
          </tbody>
      </table>
    </div>
    <div class="print-signatures-grid">
        <div class="signature-row">
            <div class="signature-col">
                ${cpcGuidanceOfficerName ? `
                    <div class="signature-label">PREPARED BY:</div>
                    <div class="signature-block">
                        <div class="signature-name">${cpcGuidanceOfficerName.toUpperCase()}</div>
                        <div class="signature-line"></div>
                        <div class="signature-title">${cpcGuidanceOfficerPosition}</div>
                    </div>
                ` : ''}
            </div>
            <div class="signature-col">
                ${guidanceOfficer ? `
                    <div class="signature-block">
                        <div class="signature-name">${guidanceOfficer.toUpperCase()}</div>
                        <div class="signature-line"></div>
                        <div class="signature-title">${guidanceOfficerPosition}</div>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="signature-row mt-8">
            <div class="signature-col">
                ${assistantPrincipalName ? `
                    <div class="signature-label">NOTED BY:</div>
                    <div class="signature-block">
                        <div class="signature-name">${assistantPrincipalName.toUpperCase()}</div>
                        <div class="signature-line"></div>
                        <div class="signature-title">${assistantPrincipalPosition}</div>
                    </div>
                ` : ''}
            </div>
            <div class="signature-col">
                ${principalName ? `
                    <div class="signature-label">APPROVED BY:</div>
                    <div class="signature-block">
                        <div class="signature-name">${principalName.toUpperCase()}</div>
                        <div class="signature-line"></div>
                        <div class="signature-title">${principalPosition}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    </div>
  `;
  return content;
};