"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RecordFormActionsProps {
  currentEditId: number | null;
  clearForm: () => void;
  handleCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RecordFormActions: React.FC<RecordFormActionsProps> = ({
  currentEditId,
  clearForm,
  handleCSVImport,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mt-8">
      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
        💾 {currentEditId ? 'Save Changes' : 'Save Record'}
      </Button>
      <Button type="button" variant="outline" onClick={clearForm} className="px-6 py-3 rounded-lg">
        🗑️ Clear Form
      </Button>
      <Input type="file" id="csvFileInput" accept=".csv" className="hidden" onChange={handleCSVImport} />
      <Button type="button" variant="secondary" onClick={() => document.getElementById('csvFileInput')?.click()} className="px-6 py-3 rounded-lg">
        📁 Import CSV
      </Button>
    </div>
  );
};

export default RecordFormActions;