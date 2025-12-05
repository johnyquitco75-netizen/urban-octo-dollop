"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const ThemeBackgroundColorSettings = () => {
  const { themeBackgroundColor, setThemeBackgroundColor, db, showAlert } = useAppContext();

  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setThemeBackgroundColor(newColor);
    await db.setSetting('themeBackgroundColor', newColor);
    showAlert('Background color updated!', 'success');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="themeBackgroundColor" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          App Background Color
        </Label>
        <Input
          id="themeBackgroundColor"
          type="color"
          value={themeBackgroundColor}
          onChange={handleColorChange}
          className="w-full h-10 p-1"
        />
      </div>
    </div>
  );
};

export default ThemeBackgroundColorSettings;