"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button
import { useAppContext } from "@/context/AppContext";

const LogoUploadSettings = () => {
  const {
    db, showAlert,
    logoData, setLogoData,
    leftHeaderLogoData, setLeftHeaderLogoData,
    rightHeaderLogoData, setRightHeaderLogoData,
  } = useAppContext();

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

  const handleClearLogo = async (type: 'school' | 'leftHeader' | 'rightHeader') => {
    if (type === 'school') {
      setLogoData(null);
      await db.setSetting('logoData', null);
    } else if (type === 'leftHeader') {
      setLeftHeaderLogoData(null);
      await db.setSetting('leftHeaderLogoData', null);
    } else if (type === 'rightHeader') {
      setRightHeaderLogoData(null);
      await db.setSetting('rightHeaderLogoData', null);
    }
    showAlert('Logo cleared successfully!', 'info');
  };

  return (
    <div className="space-y-4">
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
          <div className="flex items-center gap-4 mt-4">
            <img src={logoData} className="max-w-[200px] rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="School Logo Preview" />
            <Button variant="destructive" onClick={() => handleClearLogo('school')}>
              Clear Logo
            </Button>
          </div>
        )}
      </div>

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
            <div className="flex items-center gap-4 mt-4">
              <img src={leftHeaderLogoData} className="max-w-[100px] rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="Left Header Logo Preview" />
              <Button variant="destructive" onClick={() => handleClearLogo('leftHeader')}>
                Clear Logo
              </Button>
            </div>
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
            <div className="flex items-center gap-4 mt-4">
              <img src={rightHeaderLogoData} className="max-w-[100px] rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="Right Header Logo Preview" />
              <Button variant="destructive" onClick={() => handleClearLogo('rightHeader')}>
                Clear Logo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUploadSettings;