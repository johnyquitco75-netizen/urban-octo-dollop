"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';

const ConfirmModal = () => {
  const { isConfirmModalOpen, setIsConfirmModalOpen, confirmMessage, confirmActionRef, setConfirmMessage } = useAppContext();

  const handleConfirm = () => {
    if (confirmActionRef.current) {
      confirmActionRef.current();
    }
    setIsConfirmModalOpen(false);
    setConfirmMessage(""); // Clear message after action
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setConfirmMessage(""); // Clear message on cancel
  };

  return (
    <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Confirm Action</DialogTitle>
        </DialogHeader>
        <div className="text-gray-700 dark:text-gray-200 mb-4">{confirmMessage}</div>
        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
          <Button variant="outline" onClick={handleCancelConfirm}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;