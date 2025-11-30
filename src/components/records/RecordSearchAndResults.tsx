"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface RecordSearchAndResultsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  fillFormFromRecord: (recordId: number) => void;
  deleteRecord: (recordId: number) => void;
}

const RecordSearchAndResults: React.FC<RecordSearchAndResultsProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  fillFormFromRecord,
  deleteRecord,
}) => {
  return (
    <>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by first or last name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {searchResults.length > 0 && (
        <Card className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 max-h-80 overflow-y-auto">
          <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Search Results</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs uppercase font-semibold tracking-wider">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Violation</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map(record => (
                <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-3 text-gray-800 dark:text-gray-100">{record.name}</td>
                  <td className="py-2 px-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {record.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-200">{record.violationType}</td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-200">{new Date(record.dateTime).toLocaleDateString()}</td>
                  <td className="py-2 px-3">
                    <Button variant="ghost" size="sm" onClick={() => fillFormFromRecord(record.id)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRecord(record.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-1">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
};

export default RecordSearchAndResults;