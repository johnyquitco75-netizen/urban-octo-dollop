"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const LogoMarginSettings = () => {
  const {
    leftHeaderLogoMargin, setLeftHeaderLogoMargin,
    rightHeaderLogoMargin, setRightHeaderLogoMargin,
  } = useAppContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="leftHeaderLogoMargin" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Left Header Logo Margin (px)
          </Label>
          <Input
            id="leftHeaderLogoMargin"
            type="number"
            placeholder="e.g., 5"
            value={leftHeaderLogoMargin}
            onChange={(e) => setLeftHeaderLogoMargin(parseInt(e.target.value) || 0)}
            className="w-full"
            min="0"
            max="50"
          />
        </div>
        <div>
          <Label htmlFor="rightHeaderLogoMargin" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Right Header Logo Margin (px)
          </Label>
          <Input
            id="rightHeaderLogoMargin"
            type="number"
            placeholder="e.g., 5"
            value={rightHeaderLogoMargin}
            onChange={(e) => setRightHeaderLogoMargin(parseInt(e.target.value) || 0)}
            className="w-full"
            min="0"
            max="50"
          />
        </div>
      </div>
    </div>
  );
};

export default LogoMarginSettings;