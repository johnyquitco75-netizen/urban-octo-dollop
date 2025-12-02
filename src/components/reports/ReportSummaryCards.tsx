"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface ReportSummaryCardsProps {
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ dailyCount, weeklyCount, monthlyCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-indigo-500">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📅 Daily Summary</h3>
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{dailyCount}</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">Today's Records</div>
        </div>
      </Card>
      <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📊 Weekly Summary</h3>
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">{weeklyCount}</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">This Week</div>
        </div>
      </Card>
      <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-l-4 border-yellow-500">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">📈 Monthly Summary</h3>
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{monthlyCount}</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">This Month</div>
        </div>
      </Card>
    </div>
  );
};

export default ReportSummaryCards;