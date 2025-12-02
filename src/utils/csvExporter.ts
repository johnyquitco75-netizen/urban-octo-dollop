"use client";

export const exportCsv = (records: any[]): Promise<void> => {
  return new Promise((resolve) => {
    const headers = ['Name', 'Type', 'Grade Level', 'Grade Section', 'Violation Type', 'Date', 'Time', 'Details'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        `"${record.name}"`,
        `"${record.type}"`,
        `"${record.gradeLevel || ''}"`,
        `"${record.gradeSection || ''}"`,
        `"${record.violationType}"`,
        `"${new Date(record.dateTime).toLocaleDateString()}"`,
        `"${new Date(record.dateTime).toLocaleTimeString()}"`,
        `"${record.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guidance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    resolve();
  });
};