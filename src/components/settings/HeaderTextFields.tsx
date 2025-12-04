"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const HeaderTextFields = () => {
  const {
    republicText, setRepublicText,
    departmentText, setDepartmentText,
    regionText, setRegionText,
    divisionText, setDivisionText,
  } = useAppContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="republicText" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Header Line 1 (e.g., Republic of the Philippines)
        </Label>
        <Input
          id="republicText"
          type="text"
          placeholder="Enter first line of header"
          value={republicText}
          onChange={(e) => setRepublicText(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="departmentText" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Header Line 2 (e.g., Department of Education)
        </Label>
        <Input
          id="departmentText"
          type="text"
          placeholder="Enter second line of header"
          value={departmentText}
          onChange={(e) => setDepartmentText(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="regionText" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Header Line 3 (e.g., Region VII, Central Visayas)
        </Label>
        <Input
          id="regionText"
          type="text"
          placeholder="Enter third line of header"
          value={regionText}
          onChange={(e) => setRegionText(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="divisionText" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
          Header Line 4 (e.g., Division of Cebu City)
        </Label>
        <Input
          id="divisionText"
          type="text"
          placeholder="Enter fourth line of header"
          value={divisionText}
          onChange={(e) => setDivisionText(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default HeaderTextFields;