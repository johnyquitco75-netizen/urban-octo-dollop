"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/context/AppContext";

const HeaderVisibilitySettings = () => {
  const { hideAllHeaders, setHideAllHeaders, db, showAlert } = useAppContext();

  const handleToggle = async (checked: boolean) => {
    setHideAllHeaders(checked);
    await db.setSetting('hideAllHeaders', checked);
    showAlert(`Headers are now ${checked ? 'hidden' : 'visible'}`, 'info');
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
      <Label htmlFor="hide-all-headers" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Hide All Headers (Reports & Certificates)
      </Label>
      <Switch
        id="hide-all-headers"
        checked={hideAllHeaders}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};

export default HeaderVisibilitySettings;