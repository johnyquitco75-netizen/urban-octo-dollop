"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from '@/context/AppContext';

const PhotoModal = () => {
  const { isPhotoModalOpen, setIsPhotoModalOpen, modalPhotoSrc } = useAppContext();

  return (
    <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Photo View</DialogTitle>
        </DialogHeader>
        {modalPhotoSrc && (
          <img src={modalPhotoSrc} className="max-w-full h-auto rounded-lg shadow-md" alt="Full size" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoModal;