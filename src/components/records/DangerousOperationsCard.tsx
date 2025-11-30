"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

interface DangerousOperationsCardProps {
  deleteAllRecords: () => void;
}

const DangerousOperationsCard: React.FC<DangerousOperationsCardProps> = ({ deleteAllRecords }) => {
  const { currentUserRole } = useAppContext();

  if (currentUserRole !== 'superadmin') {
    return null;
  }

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-center">
      <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Dangerous Operation</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        This will permanently delete <strong>all records</strong>. This action cannot be undone.
      </p>
      <Button variant="destructive" onClick={deleteAllRecords} className="px-4 py-2 text-sm">
        🗑️ Delete All Records
      </Button>
    </Card>
  );
};

export default DangerousOperationsCard;