"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const CustomPhraseSettings = () => {
  const {
    customPhrase, setCustomPhrase,
    customPhraseFontSize, setCustomPhraseFontSize,
    customPhraseFontColor, setCustomPhraseFontColor,
  } = useAppContext();

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="customPhraseFontSize" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Custom Phrase Font Size
          </Label>
          <Select value={customPhraseFontSize} onValueChange={setCustomPhraseFontSize}>
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
          <Label htmlFor="customPhraseFontColor" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Custom Phrase Font Color
          </Label>
          <Input
            id="customPhraseFontColor"
            type="color"
            value={customPhraseFontColor}
            onChange={(e) => setCustomPhraseFontColor(e.target.value)}
            className="w-full h-10 p-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomPhraseSettings;