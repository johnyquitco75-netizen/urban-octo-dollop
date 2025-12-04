"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

const PasswordChangeSettings = () => {
  const {
    db, showAlert, currentUserRole,
    appPasswords, setAppPasswords,
  } = useAppContext();

  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [superAdminPasswordInput, setSuperAdminPasswordInput] = useState("");

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

  if (currentUserRole !== 'superadmin') {
    return null;
  }

  return (
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
  );
};

export default PasswordChangeSettings;