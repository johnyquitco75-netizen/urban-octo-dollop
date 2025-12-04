"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface SettingsActionButtonsProps {
  onSaveSettings: () => void;
  onDownloadSampleCSV: () => void;
}

const SettingsActionButtons: React.FC<SettingsActionButtonsProps> = ({ onSaveSettings, onDownloadSampleCSV }) => {
  return (
    <div className="flex flex-wrap gap-4 mt-8">
      <Button onClick={onSaveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
        💾 Save Settings
      </Button>
      <Button variant="secondary" onClick={onDownloadSampleCSV} className="px-6 py-3 rounded-lg">
        📄 Download Sample CSV
      </Button>
    </div>
  );
};

export default SettingsActionButtons;