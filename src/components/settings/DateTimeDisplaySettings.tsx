"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const DateTimeDisplaySettings = () => {
  const {
    dateTimeFontSize, setDateTimeFontSize,
    dateTimeFontColor, setDateTimeFontColor,
  } = useAppContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="dateTimeFontSize" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Date/Time Font Size
          </Label>
          <Select value={dateTimeFontSize} onValueChange={setDateTimeFontSize}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.875rem">Small (14px)</SelectItem>
              <SelectItem value="1rem">Medium (16px)</SelectItem>
              <SelectItem value="1.125rem">Large (18px)</SelectItem>
              <SelectItem value="1.25rem">X-Large (20px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateTimeFontColor" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Date/Time Font Color
          </Label>
          <Input
            id="dateTimeFontColor"
            type="color"
            value={dateTimeFontColor}
            onChange={(e) => setDateTimeFontColor(e.target.value)}
            className="w-full h-10 p-1"
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplaySettings;