"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

const AddRecordSection = () => {
  const { db, showAlert, currentUserRole, customViolations, setCustomViolations, setConfirmMessage, confirmActionRef, setIsConfirmModalOpen } = useAppContext();

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

  const clearForm = () => {
    setRecordType("student");
    setFullName("");
    setGradeLevel("");
    setRecordDate("");
    setRecordTime("");
    setViolationType("");
    setDetails("");
    setCapturedPhoto(null);
    setIsCameraActive(false);
    setIsPhotoCaptured(false);
    setCurrentEditId(null);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
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
      // You might want to trigger a dashboard/report update here if they were separate
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
      // You might want to trigger a dashboard/report update here if they were separate
    } catch (error) {
      console.error('Error saving record:', error);
      showAlert('Failed to save record. Please try again.', 'error');
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setIsPhotoCaptured(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      showAlert('Unable to access camera. Please check permissions.', 'error');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        setIsPhotoCaptured(true);
        setIsCameraActive(false);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsPhotoCaptured(false);
    startCamera();
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
      if (imported > 0) {
        // Trigger dashboard/report update if needed
      }
    } catch (error) {
      console.error('CSV import error:', error);
      showAlert('Failed to import CSV file. Please check the file format.', 'error');
    }
    e.target.value = ''; // Clear file input
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
    }, 300); // Debounce search input
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
    setIsCameraActive(false); // Ensure camera is off when editing
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setSearchQuery(""); // Clear search results
  };

  const deleteRecord = async (recordId: number) => {
    const onConfirm = async () => {
      try {
        await db.deleteRecord(recordId);
        showAlert('Record deleted!', 'success');
        renderSearchResults(searchQuery); // Refresh search results if applicable
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
      {currentUserRole === 'superadmin' && (
        <Card className="p-6 rounded-2xl shadow-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-center">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Dangerous Operation</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            This will permanently delete <strong>all records</strong>. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={deleteAllRecords} className="px-4 py-2 text-sm">
            🗑️ Delete All Records
          </Button>
        </Card>
      )}

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

      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add New Record</h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <Label htmlFor="recordType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Record Type
          </Label>
          <Select value={recordType} onValueChange={setRecordType} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="gradeLevel" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Grade Level
            </Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="recordDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Date
            </Label>
            <Input
              id="recordDate"
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="recordTime" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Time
            </Label>
            <Input
              id="recordTime"
              type="time"
              value={recordTime}
              onChange={(e) => setRecordTime(e.target.value)}
              required
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="violationType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Violation Type
          </Label>
          <Select value={violationType} onValueChange={setViolationType} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Violation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Late Arrival">Late Arrival</SelectItem>
              <SelectItem value="Uniform Violation">Uniform Violation</SelectItem>
              <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
              <SelectItem value="Academic Dishonesty">Academic Dishonesty</SelectItem>
              <SelectItem value="Bullying">Bullying</SelectItem>
              <SelectItem value="Property Damage">Property Damage</SelectItem>
              <SelectItem value="Inappropriate Language">Inappropriate Language</SelectItem>
              <SelectItem value="Technology Misuse">Technology Misuse</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              {customViolations.map(violation => (
                <SelectItem key={violation} value={violation} className="custom-option">
                  {violation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 mt-3">
            <Input
              type="text"
              placeholder="Add custom violation type"
              value={newCustomViolation}
              onChange={(e) => setNewCustomViolation(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={addCustomViolation}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {customViolations.map(violation => (
              <span key={violation} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 dark:bg-indigo-900 dark:text-indigo-300">
                {violation}
                <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800" onClick={() => removeCustomViolation(violation)}>
                  &times;
                </Button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="details" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Details/Notes
          </Label>
          <Textarea
            id="details"
            placeholder="Describe the incident in detail..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full min-h-[120px]"
          />
        </div>

        <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center bg-gray-50 dark:bg-gray-800">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">📸 Attach Photo (Optional)</h4>
          {isCameraActive && (
            <video ref={videoRef} className="w-full max-h-80 object-cover rounded-lg shadow-md mb-4" autoPlay playsInline></video>
          )}
          {isPhotoCaptured && capturedPhoto && (
            <img src={capturedPhoto} className="w-full max-h-80 object-cover rounded-lg shadow-md mb-4" alt="Captured" />
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
          <div className="flex justify-center gap-3 flex-wrap">
            {!isCameraActive && !isPhotoCaptured && (
              <Button type="button" variant="secondary" onClick={startCamera}>
                📷 Start Camera
              </Button>
            )}
            {isCameraActive && (
              <Button type="button" onClick={capturePhoto}>
                📸 Capture
              </Button>
            )}
            {isPhotoCaptured && (
              <Button type="button" variant="secondary" onClick={retakePhoto}>
                🔄 Retake
              </Button>
            )}
          </div>
        </div>

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
      </form>
    </section>
  );
};

export default AddRecordSection;