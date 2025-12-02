"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

const SettingsSection = () => {
  const {
    db, showAlert, currentUserRole,
    schoolName, setSchoolName,
    schoolAddress, setSchoolAddress,
    customPhrase, setCustomPhrase,
    logoData, setLogoData,
    leftHeaderLogoData, setLeftHeaderLogoData, // New state
    rightHeaderLogoData, setRightHeaderLogoData, // New state
    guidanceOfficer, setGuidanceOfficer,
    cpcGuidanceOfficerName, setCpcGuidanceOfficerName,
    principalName, setPrincipalName,
    assistantPrincipalName, setAssistantPrincipalName,
    appPasswords, setAppPasswords,
    currentTheme, setCurrentTheme,
    loadSettings,
  } = useAppContext();

  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [superAdminPasswordInput, setSuperAdminPasswordInput] = useState("");

  const saveSettings = async () => {
    await db.setSetting('schoolName', schoolName);
    await db.setSetting('schoolAddress', schoolAddress);
    await db.setSetting('customPhrase', customPhrase);
    await db.setSetting('leftHeaderLogoData', leftHeaderLogoData); // Save new setting
    await db.setSetting('rightHeaderLogoData', rightHeaderLogoData); // Save new setting
    await db.setSetting('guidanceOfficer', guidanceOfficer);
    await db.setSetting('cpcGuidanceOfficerName', cpcGuidanceOfficerName);
    await db.setSetting('principalName', principalName);
    await db.setSetting('assistantPrincipalName', assistantPrincipalName);
    await db.setSetting('theme', currentTheme);
    showAlert('Settings saved successfully!', 'success');
    loadSettings(); // Reload settings to ensure UI reflects changes
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'school' | 'leftHeader' | 'rightHeader') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAlert('File size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as string;
      if (type === 'school') {
        setLogoData(data);
        await db.setSetting('logoData', data);
      } else if (type === 'leftHeader') {
        setLeftHeaderLogoData(data);
        await db.setSetting('leftHeaderLogoData', data);
      } else if (type === 'rightHeader') {
        setRightHeaderLogoData(data);
        await db.setSetting('rightHeaderLogoData', data);
      }
      showAlert('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
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

  const changePasswords = async () => {
    if (currentUserRole !== 'superadmin') {
      showAlert('Only Super Admin can change passwords!', 'error');
      return;
    }
    if (!adminPasswordInput && !superAdminPasswordInput) {
      showAlert('Please enter at least one new password', 'error');
      return;
    }
    const updatedPasswords = { ...appPasswords };
    if (adminPasswordInput) {
      updatedPasswords.admin = adminPasswordInput;
    }
    if (superAdminPasswordInput) {
      updatedPasswords.superadmin = superAdminPasswordInput;
    }
    setAppPasswords(updatedPasswords);
    await db.setSetting('passwords', updatedPasswords);
    setAdminPasswordInput('');
    setSuperAdminPasswordInput('');
    showAlert('Passwords changed successfully!', 'success');
  };

  return (
    <section id="settings" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>

      <div>
        <Label htmlFor="settingsSchoolName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          School Name
        </Label>
        <Textarea
          id="settingsSchoolName"
          placeholder="Enter your school name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          rows={2}
          className="w-full min-h-[60px]"
        />
      </div>

      <div>
        <Label htmlFor="settingsSchoolAddress" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          School Address
        </Label>
        <Textarea
          id="settingsSchoolAddress"
          placeholder="Enter your school address"
          value={schoolAddress}
          onChange={(e) => setSchoolAddress(e.target.value)}
          rows={2}
          className="w-full min-h-[60px]"
        />
      </div>

      <div>
        <Label htmlFor="customPhrase" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Custom Phrase (for App Header)
        </Label>
        <Input
          id="customPhrase"
          type="text"
          placeholder="Enter custom phrase for app header"
          value={customPhrase}
          onChange={(e) => setCustomPhrase(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="logoUpload" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          School Logo (for Dashboard)
        </Label>
        <div
          className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
          onClick={() => document.getElementById('schoolLogoFileInput')?.click()}
        >
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">📁 Click to upload school logo</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Recommended: PNG or JPG, max 2MB</div>
        </div>
        <Input type="file" id="schoolLogoFileInput" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'school')} />
        {logoData && (
          <img src={logoData} className="max-w-[200px] mt-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="School Logo Preview" />
        )}
      </div>

      {/* New Header Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="leftHeaderLogoUpload" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Left Header Logo (for Reports/Certificates)
          </Label>
          <div
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
            onClick={() => document.getElementById('leftHeaderLogoFileInput')?.click()}
          >
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">📁 Upload Left Logo</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recommended: PNG or JPG, max 2MB</div>
          </div>
          <Input type="file" id="leftHeaderLogoFileInput" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'leftHeader')} />
          {leftHeaderLogoData && (
            <img src={leftHeaderLogoData} className="max-w-[100px] mt-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="Left Header Logo Preview" />
          )}
        </div>
        <div>
          <Label htmlFor="rightHeaderLogoUpload" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Right Header Logo (for Reports/Certificates)
          </Label>
          <div
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
            onClick={() => document.getElementById('rightHeaderLogoFileInput')?.click()}
          >
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">📁 Upload Right Logo</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recommended: PNG or JPG, max 2MB</div>
          </div>
          <Input type="file" id="rightHeaderLogoFileInput" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'rightHeader')} />
          {rightHeaderLogoData && (
            <img src={rightHeaderLogoData} className="max-w-[100px] mt-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="Right Header Logo Preview" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="guidanceOfficer" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Guidance Officer Name
          </Label>
          <Input
            id="guidanceOfficer"
            type="text"
            placeholder="Officer name for reports"
            value={guidanceOfficer}
            onChange={(e) => setGuidanceOfficer(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="cpcGuidanceOfficerName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            CPC/Guidance Officer Name
          </Label>
          <Input
            id="cpcGuidanceOfficerName"
            type="text"
            placeholder="CPC/Guidance Officer name for reports"
            value={cpcGuidanceOfficerName}
            onChange={(e) => setCpcGuidanceOfficerName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="principalName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Principal Name
          </Label>
          <Input
            id="principalName"
            type="text"
            placeholder="Principal name for reports"
            value={principalName}
            onChange={(e) => setPrincipalName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="assistantPrincipalName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Assistant Principal Name
          </Label>
          <Input
            id="assistantPrincipalName"
            type="text"
            placeholder="Assistant Principal name for reports"
            value={assistantPrincipalName}
            onChange={(e) => setAssistantPrincipalName(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="themeSelector" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Theme
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'default' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            onClick={() => setCurrentTheme('default')}
          >
            <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            <div className="text-center font-medium text-gray-800 dark:text-gray-100">Default</div>
          </Card>
          <Card
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'green' ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            onClick={() => setCurrentTheme('green')}
          >
            <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-green-500 to-teal-600"></div>
            <div className="text-center font-medium text-gray-800 dark:text-gray-100">Green</div>
          </Card>
          <Card
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'purple' ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            onClick={() => setCurrentTheme('purple')}
          >
            <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-purple-500 to-fuchsia-600"></div>
            <div className="text-center font-medium text-gray-800 dark:text-gray-100">Purple</div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <Button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
          💾 Save Settings
        </Button>
        <Button variant="secondary" onClick={downloadSampleCSV} className="px-6 py-3 rounded-lg">
          📄 Download Sample CSV
        </Button>
      </div>

      {currentUserRole === 'superadmin' && (
        <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">🔒 Change Passwords</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="adminPassword" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Admin Password
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="New admin password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="superAdminPassword" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Super Admin Password
              </Label>
              <Input
                id="superAdminPassword"
                type="password"
                placeholder="New super admin password"
                value={superAdminPasswordInput}
                onChange={(e) => setSuperAdminPasswordInput(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button variant="destructive" onClick={changePasswords} className="mt-6 px-6 py-3 rounded-lg">
            🔐 Change Passwords
          </Button>
        </Card>
      )}
    </section>
  );
};

export default SettingsSection;