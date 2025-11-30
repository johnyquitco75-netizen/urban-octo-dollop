"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ViolationTypeManagementProps {
  violationType: string;
  setViolationType: (type: string) => void;
  customViolations: string[];
  newCustomViolation: string;
  setNewCustomViolation: (violation: string) => void;
  addCustomViolation: () => void;
  removeCustomViolation: (violation: string) => void;
}

const ViolationTypeManagement: React.FC<ViolationTypeManagementProps> = ({
  violationType,
  setViolationType,
  customViolations,
  newCustomViolation,
  setNewCustomViolation,
  addCustomViolation,
  removeCustomViolation,
}) => {
  return (
    <div>
      <Label htmlFor="violationType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
        Violation Type
      </Label>
      <Select value={violationType} onValueChange={setViolationType} required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Violation Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Late Arrival">Late Arrival</SelectItem>
          <SelectItem value="Uniform Violation">Uniform Violation</SelectItem>
          <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
          <SelectItem value="Academic Dishonesty">Academic Dishonesty</SelectItem>
          <SelectItem value="Bullying">Bullying</SelectItem>
          <SelectItem value="Property Damage">Property Damage</SelectItem>
          <SelectItem value="Inappropriate Language">Inappropriate Language</SelectItem>
          <SelectItem value="Technology Misuse">Technology Misuse</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
          {customViolations.map(violation => (
            <SelectItem key={violation} value={violation} className="custom-option">
              {violation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2 mt-3">
        <Input
          type="text"
          placeholder="Add custom violation type"
          value={newCustomViolation}
          onChange={(e) => setNewCustomViolation(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={addCustomViolation}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {customViolations.map(violation => (
          <span key={violation} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 dark:bg-indigo-900 dark:text-indigo-300">
            {violation}
            <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800" onClick={() => removeCustomViolation(violation)}>
              &times;
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ViolationTypeManagement;