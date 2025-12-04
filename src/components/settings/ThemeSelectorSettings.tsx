"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const ThemeSelectorSettings = () => {
  const { currentTheme, setCurrentTheme } = useAppContext();

  return (
    <div className="space-y-4">
      <Label htmlFor="themeSelector" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
        Theme
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'default' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          onClick={() => setCurrentTheme('default')}
        >
          <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          <div className="text-center font-medium text-gray-800 dark:text-gray-100">Default</div>
        </Card>
        <Card
          className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'green' ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          onClick={() => setCurrentTheme('green')}
        >
          <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-green-500 to-teal-600"></div>
          <div className="text-center font-medium text-gray-800 dark:text-gray-100">Green</div>
        </Card>
        <Card
          className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${currentTheme === 'purple' ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          onClick={() => setCurrentTheme('purple')}
        >
          <div className="h-10 rounded-md mb-2 bg-gradient-to-br from-purple-500 to-fuchsia-600"></div>
          <div className="text-center font-medium text-gray-800 dark:text-gray-100">Purple</div>
        </Card>
      </div>
    </div>
  );
};

export default ThemeSelectorSettings;