"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";

// Import new modular components
import HeaderTextFields from "./HeaderTextFields";
import SchoolInfoSettings from "./SchoolInfoSettings";
import CustomPhraseSettings from "./CustomPhraseSettings";
import DateTimeDisplaySettings from "./DateTimeDisplaySettings";
import LogoUploadSettings from "./LogoUploadSettings";
import PersonnelSignatureSettings from "./PersonnelSignatureSettings";
import ThemeSelectorSettings from "./ThemeSelectorSettings";
import SettingsActionButtons from "./SettingsActionButtons";
import PasswordChangeSettings from "./PasswordChangeSettings";
import HeaderVisibilitySettings from "./HeaderVisibilitySettings"; // Import new component

const SettingsSection = () => {
  const {
    db, showAlert,
    schoolName, schoolAddress,
    customPhrase,
    logoData, leftHeaderLogoData, rightHeaderLogoData,
    guidanceOfficer, guidanceOfficerPosition,
    cpcGuidanceOfficerName, cpcGuidanceOfficerPosition,
    principalName, principalPosition,
    assistantPrincipalName, assistantPrincipalPosition,
    currentTheme,
    republicText, departmentText, regionText, divisionText,
    customPhraseFontSize, customPhraseFontColor,
    dateTimeFontSize, dateTimeFontColor,
    hideAllHeaders, // Get new state
    loadSettings, // Still need to call this after saving
  } = useAppContext();

  const saveSettings = async () => {
    await db.setSetting('schoolName', schoolName);
    await db.setSetting('schoolAddress', schoolAddress);
    await db.setSetting('customPhrase', customPhrase);
    await db.setSetting('leftHeaderLogoData', leftHeaderLogoData);
    await db.setSetting('rightHeaderLogoData', rightHeaderLogoData);
    await db.setSetting('guidanceOfficer', guidanceOfficer);
    await db.setSetting('guidanceOfficerPosition', guidanceOfficerPosition);
    await db.setSetting('cpcGuidanceOfficerName', cpcGuidanceOfficerName);
    await db.setSetting('cpcGuidanceOfficerPosition', cpcGuidanceOfficerPosition);
    await db.setSetting('principalName', principalName);
    await db.setSetting('principalPosition', principalPosition);
    await db.setSetting('assistantPrincipalName', assistantPrincipalName);
    await db.setSetting('assistantPrincipalPosition', assistantPrincipalPosition);
    await db.setSetting('theme', currentTheme);
    await db.setSetting('republicText', republicText);
    await db.setSetting('departmentText', departmentText);
    await db.setSetting('regionText', regionText);
    await db.setSetting('divisionText', divisionText);
    await db.setSetting('customPhraseFontSize', customPhraseFontSize);
    await db.setSetting('customPhraseFontColor', customPhraseFontColor);
    await db.setSetting('dateTimeFontSize', dateTimeFontSize);
    await db.setSetting('dateTimeFontColor', dateTimeFontColor);
    await db.setSetting('hideAllHeaders', hideAllHeaders); // Save new state

    showAlert('Settings saved successfully!', 'success');
    loadSettings(); // Reload settings to ensure UI reflects changes
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'type', 'gradeLevel', 'violationType', 'date', 'time', 'details'],
      ['John Doe', 'student', 'Grade 10', 'Late Arrival', '2024-01-15', '08:30', 'Student arrived 30 minutes late'],
      ['Jane Smith', 'student', 'Grade 9', 'Uniform Violation', '2024-01-15', '09:00', 'Missing school ID'],
      ['Bob Johnson', 'teacher', '', 'Other', '2024-01-15', '10:15', 'Parking violation']
    ];
    const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import.csv';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Sample CSV downloaded!', 'success');
  };

  return (
    <section id="settings" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>

      <HeaderVisibilitySettings /> {/* New component */}
      <HeaderTextFields />
      <SchoolInfoSettings />
      <CustomPhraseSettings />
      <DateTimeDisplaySettings />
      <LogoUploadSettings />
      <PersonnelSignatureSettings />
      <ThemeSelectorSettings />

      <SettingsActionButtons
        onSaveSettings={saveSettings}
        onDownloadSampleCSV={downloadSampleCSV}
      />

      <PasswordChangeSettings />
    </section>
  );
};

export default SettingsSection;