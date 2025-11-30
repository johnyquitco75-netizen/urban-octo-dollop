"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import DangerousOperationsCard from "./DangerousOperationsCard";
import RecordSearchAndResults from "./RecordSearchAndResults";
import RecordFormFields from "./RecordFormFields";
import ViolationTypeManagement from "./ViolationTypeManagement";
import CameraAttachment from "./CameraAttachment";
import RecordFormActions from "./RecordFormActions";

const AddRecordSection = () => {
  const { db, showAlert, customViolations, setCustomViolations, setConfirmMessage, confirmActionRef, setIsConfirmModalOpen } = useAppContext();

  // Record form state
  const [recordType, setRecordType] = useState("student");
  const [fullName, setFullName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordTime, setRecordTime] = useState("");
  const [violationType, setViolationType] = useState("");
  const [details, setDetails] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [newCustomViolation, setNewCustomViolation] = useState("");
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getFirstAndLastName = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      first: parts[0] || '',
      last: parts.length > 1 ? parts[parts.length - 1] : ''
    };
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    setRecordDate(now.toISOString().split('T')[0]);
    setRecordTime(now.toTimeString().split(':').slice(0, 2).join(':'));
  };

  useEffect(() => {
    setCurrentDateTime();
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      // No need to remove handleLoadedMetadata here, it's managed by CameraAttachment
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, []);

  const clearForm = () => {
    setRecordType("student");
    setFullName("");
    setGradeLevel("");
    setRecordDate("");
    setRecordTime("");
    setViolationType("");
    setDetails("");
    setCapturedPhoto(null);
    setIsPhotoCaptured(false);
    setCurrentEditId(null);
    stopCamera();
    setCurrentDateTime();
  };

  const handleEditSave = async () => {
    if (!currentEditId) {
      showAlert('No record selected for editing!', 'error');
      return;
    }
    const formData = {
      type: recordType,
      name: fullName,
      gradeLevel: gradeLevel,
      dateTime: `${recordDate}T${recordTime}`,
      violationType: violationType,
      details: details,
      photoData: capturedPhoto,
    };
    try {
      await db.updateRecord(currentEditId, formData);
      showAlert('Record updated successfully!', 'success');
      clearForm();
    } catch (error) {
      console.error('Error updating record:', error);
      showAlert('Failed to update record. Please try again.', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEditId) {
      handleEditSave();
      return;
    }
    const formData = {
      type: recordType,
      name: fullName,
      gradeLevel: gradeLevel,
      dateTime: `${recordDate}T${recordTime}`,
      violationType: violationType,
      details: details,
      photoData: capturedPhoto,
    };
    try {
      await db.addRecord(formData);
      showAlert('Record saved successfully!', 'success');
      clearForm();
    } catch (error) {
      console.error('Error saving record:', error);
      showAlert('Failed to save record. Please try again.', 'error');
    }
  };

  // Custom violations
  const addCustomViolation = async () => {
    const violation = newCustomViolation.trim();
    if (violation && !customViolations.includes(violation)) {
      const updatedViolations = [...customViolations, violation];
      setCustomViolations(updatedViolations);
      await db.setSetting('customViolations', updatedViolations);
      setNewCustomViolation("");
      showAlert('Custom violation type added!', 'success');
    }
  };

  const removeCustomViolation = async (violationToRemove: string) => {
    const updatedViolations = customViolations.filter(v => v !== violationToRemove);
    setCustomViolations(updatedViolations);
    await db.setSetting('customViolations', updatedViolations);
    showAlert('Custom violation type removed!', 'success');
  };

  // CSV Import
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        showAlert('No valid data found in CSV file', 'error');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      let imported = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: { [key: string]: string } = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          if (!row.name || !row.violationType) {
            errors++;
            continue;
          }

          const record = {
            type: row.type || 'student',
            name: row.name.trim(),
            gradeLevel: row.gradeLevel || '',
            dateTime: row.date && row.time ?
              `${row.date}T${row.time}` :
              new Date().toISOString(),
            violationType: row.violationType.trim(),
            details: row.details || '',
            photoData: null
          };
          await db.addRecord(record);
          imported++;
        } catch (error) {
          console.error('Error importing row:', error);
          errors++;
        }
      }

      let message = `Successfully imported ${imported} records!`;
      if (errors > 0) {
        message += ` (${errors} rows skipped due to errors)`;
      }
      showAlert(message, imported > 0 ? 'success' : 'error');
    } catch (error) {
      console.error('CSV import error:', error);
      showAlert('Failed to import CSV file. Please check the file format.', 'error');
    }
    e.target.value = '';
  };

  const renderSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const records = await db.getAllRecords();
    const lowerQuery = query.toLowerCase();
    const filtered = records.filter(record => {
      const { first, last } = getFirstAndLastName(record.name);
      return first.toLowerCase().includes(lowerQuery) || last.toLowerCase().includes(lowerQuery);
    });
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setSearchResults(filtered);
  }, [db]);

  useEffect(() => {
    const handler = setTimeout(() => {
      renderSearchResults(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, renderSearchResults]);

  const fillFormFromRecord = async (recordId: number) => {
    const records = await db.getAllRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    setCurrentEditId(record.id);
    setRecordType(record.type);
    setFullName(record.name);
    setGradeLevel(record.gradeLevel || "");
    const dt = new Date(record.dateTime);
    setRecordDate(dt.toISOString().split('T')[0]);
    setRecordTime(dt.toTimeString().slice(0, 5));
    setViolationType(record.violationType);
    setDetails(record.details || "");
    setCapturedPhoto(record.photoData || null);
    setIsPhotoCaptured(!!record.photoData);
    stopCamera();

    setSearchQuery("");
  };

  const deleteRecord = async (recordId: number) => {
    const onConfirm = async () => {
      try {
        await db.deleteRecord(recordId);
        showAlert('Record deleted!', 'success');
        renderSearchResults(searchQuery);
      } catch (error) {
        console.error('Error deleting record:', error);
        showAlert('Failed to delete record.', 'error');
      }
    };
    setConfirmMessage('Are you sure you want to delete this record?');
    confirmActionRef.current = onConfirm;
    setIsConfirmModalOpen(true);
  };

  const deleteAllRecords = async () => {
    const onConfirm = async () => {
      try {
        await db.deleteAllRecords();
        showAlert('✅ All records deleted successfully!', 'success');
        setSearchQuery('');
        setSearchResults([]);
        clearForm();
      } catch (error) {
        console.error('Delete all error:', error);
        showAlert('An error occurred while deleting records.', 'error');
      }
    };
    setConfirmMessage('⚠️ Are you sure you want to delete ALL records?\nThis action cannot be undone!');
    confirmActionRef.current = onConfirm;
    setIsConfirmModalOpen(true);
  };

  return (
    <section id="add-record" className="space-y-6">
      <DangerousOperationsCard deleteAllRecords={deleteAllRecords} />

      <RecordSearchAndResults
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        fillFormFromRecord={fillFormFromRecord}
        deleteRecord={deleteRecord}
      />

      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Record</h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <RecordFormFields
          recordType={recordType}
          setRecordType={setRecordType}
          fullName={fullName}
          setFullName={setFullName}
          gradeLevel={gradeLevel}
          setGradeLevel={setGradeLevel}
          recordDate={recordDate}
          setRecordDate={setRecordDate}
          recordTime={recordTime}
          setRecordTime={setRecordTime}
          details={details}
          setDetails={setDetails}
        />

        <ViolationTypeManagement
          violationType={violationType}
          setViolationType={setViolationType}
          customViolations={customViolations}
          newCustomViolation={newCustomViolation}
          setNewCustomViolation={setNewCustomViolation}
          addCustomViolation={addCustomViolation}
          removeCustomViolation={removeCustomViolation}
        />

        <CameraAttachment
          isCameraActive={isCameraActive}
          setIsCameraActive={setIsCameraActive}
          isPhotoCaptured={isPhotoCaptured}
          setIsPhotoCaptured={setIsPhotoCaptured}
          capturedPhoto={capturedPhoto}
          setCapturedPhoto={setCapturedPhoto}
          isVideoReady={isVideoReady}
          setIsVideoReady={setIsVideoReady}
          videoRef={videoRef}
          canvasRef={canvasRef}
          mediaStreamRef={mediaStreamRef}
        />

        <RecordFormActions
          currentEditId={currentEditId}
          clearForm={clearForm}
          handleCSVImport={handleCSVImport}
        />
      </form>
    </section>
  );
};

export default AddRecordSection;