"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const SchoolInfoSettings = () => {
  const {
    schoolName, setSchoolName,
    schoolAddress, setSchoolAddress,
  } = useAppContext();

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default SchoolInfoSettings;