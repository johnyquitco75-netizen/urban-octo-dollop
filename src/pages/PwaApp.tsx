"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { jsPDF } from 'jspdf';

// IndexedDB Helper
class DatabaseManager {
  dbName = 'EGuidanceDB';
  version = 1;
  db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          recordStore.createIndex('type', 'type', { unique: false });
          recordStore.createIndex('violationType', 'violationType', { unique: false });
          recordStore.createIndex('dateTime', 'dateTime', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addRecord(record: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    return store.add({
      ...record,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    });
  }

  async updateRecord(id: number, record: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    const existing: any = await new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!existing) throw new Error('Record not found');
    return store.put({
      ...existing,
      ...record,
      modifiedAt: new Date().toISOString()
    });
  }

  async getAllRecords(): Promise<any[]> {
    const transaction = this.db!.transaction(['records'], 'readonly');
    const store = transaction.objectStore('records');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    const transaction = this.db!.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key: string, value: any): Promise<IDBRequest> {
    const transaction = this.db!.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    return store.put({ key, value });
  }
}

const db = new DatabaseManager();

export const PwaApp = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "superadmin" | null>(null);
  const [accessLevel, setAccessLevel] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [appPasswords, setAppPasswords] = useState<{ admin: string; superadmin: string }>({
    admin: 'admin123',
    superadmin: 'superadmin456'
  });

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentSection, setCurrentSection] = useState("dashboard");

  // Settings state
  const [schoolName, setSchoolName] = useState("Sample Elementary School");
  const [customPhrase, setCustomPhrase] = useState("add custom phrase here:");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [guidanceOfficer, setGuidanceOfficer] = useState("");
  const [cpcGuidanceOfficerName, setCpcGuidanceOfficerName] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [assistantPrincipalName, setAssistantPrincipalName] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [superAdminPasswordInput, setSuperAdminPasswordInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState("default");

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
  const [customViolations, setCustomViolations] = useState<string[]>([]);
  const [newCustomViolation, setNewCustomViolation] = useState("");
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);

  // Dashboard state
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [thisMonthRecords, setThisMonthRecords] = useState(0);
  const [lastEntryDate, setLastEntryDate] = useState("Never");
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [violationChartData, setViolationChartData] = useState<any[]>([]);
  const [severityChartData, setSeverityChartData] = useState<any[]>([]);

  // Reports state
  const [reportType, setReportType] = useState("custom");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [reportViolationType, setReportViolationType] = useState("");
  const [reportPreviewContent, setReportPreviewContent] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);

  // Certificate state
  const [certificateTemplate, setCertificateTemplate] = useState("standard");
  const [customCertificateContent, setCustomCertificateContent] = useState("");
  const [previewStudentName, setPreviewStudentName] = useState("");
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split('T')[0]);
  const [certificatePreviewHtml, setCertificatePreviewHtml] = useState<string | null>(null);

  // Utility for showing alerts
  const showAlert = useCallback((message: string, type: "success" | "error" | "info") => {
    if (type === "success") showSuccess(message);
    else if (type === "error") showError(message);
    else showLoading(message); // Using loading for info for now, can be changed to a custom info toast
    setTimeout(() => dismissToast(), 5000);
  }, []);

  // Helper to get first and last name
  const getFirstAndLastName = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      first: parts[0] || '',
      last: parts.length > 1 ? parts[parts.length - 1] : ''
    };
  };

  // --- Initialization and Login ---
  useEffect(() => {
    const initApp = async () => {
      try {
        await db.init();
        await loadPasswords();
        showAlert('App loaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('Failed to initialize app. Please refresh the page.', 'error');
      }
    };
    initApp();
  }, [showAlert]);

  const loadPasswords = async () => {
    const savedPasswords = await db.getSetting('passwords');
    if (savedPasswords) {
      setAppPasswords(savedPasswords);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessLevel || !password) {
      showAlert('Please select access level and enter password', 'error');
      return;
    }
    if (appPasswords[accessLevel as keyof typeof appPasswords] === password) {
      showAlert('Login successful!', 'success');
      setCurrentUserRole(accessLevel as "admin" | "superadmin");
      setIsLoggedIn(true);
      await loadSettings();
      await loadCustomViolations();
      await loadCertificateSettings();
      updateDateTime();
      await updateDashboard();
      await updateReportSummary();
      setCurrentDateTime();
    } else {
      showAlert('Invalid credentials. Please try again.', 'error');
      setPassword('');
    }
  };

  // --- Date and Time Update ---
  const updateDateTime = useCallback(() => {
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    };
    setCurrentTime(now.toLocaleTimeString('en-US', timeOptions));
    setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, updateDateTime]);

  // --- Navigation ---
  const switchSection = (sectionName: string) => {
    setCurrentSection(sectionName);
    if (sectionName === 'dashboard') {
      updateDashboard();
    } else if (sectionName === 'reports') {
      updateReportSummary();
    }
    setReportPreviewContent(null); // Clear report preview on section change
    setCertificatePreviewHtml(null); // Clear certificate preview on section change
  };

  // --- Dashboard Updates ---
  const updateDashboard = useCallback(async () => {
    const records = await db.getAllRecords();
    setTotalRecords(records.length);
    const uniqueStudents = new Set(records.map(r => r.name)).size;
    setTotalStudents(uniqueStudents);
    const now = new Date();
    const thisMonth = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate.getMonth() === now.getMonth() &&
             recordDate.getFullYear() === now.getFullYear();
    }).length;
    setThisMonthRecords(thisMonth);
    const lastEntry = records.length > 0 ?
      new Date(Math.max(...records.map(r => new Date(r.dateTime).getTime()))).toLocaleDateString() :
      'Never';
    setLastEntryDate(lastEntry);
    updateViolationBarChart(records);
    updateSeverityPieChart(records);
    updateRecentRecords(records);
  }, []);

  const updateViolationBarChart = (records: any[]) => {
    const violationCounts: { [key: string]: number } = {};
    records.forEach(record => {
      violationCounts[record.violationType] = (violationCounts[record.violationType] || 0) + 1;
    });
    const chartData = Object.entries(violationCounts).map(([name, count]) => ({
      name,
      count,
      percentage: records.length > 0 ? Math.round((count / records.length) * 100) : 0
    }));
    setViolationChartData(chartData);
  };

  const updateSeverityPieChart = (records: any[]) => {
    const severityCounts = { Minor: 0, Major: 0, Severe: 0 };
    const severityMapping: { [key: string]: "Minor" | "Major" | "Severe" } = {
      'Late Arrival': 'Minor',
      'Uniform Violation': 'Minor',
      'Disruptive Behavior': 'Major',
      'Academic Dishonesty': 'Major',
      'Bullying': 'Severe',
      'Property Damage': 'Severe',
      'Inappropriate Language': 'Major',
      'Technology Misuse': 'Major',
      'Other': 'Minor'
    };
    records.forEach(record => {
      const severity = severityMapping[record.violationType] || 'Minor';
      severityCounts[severity]++;
    });

    const total = records.length;
    const chartData = [
      { name: 'Minor', value: severityCounts.Minor, percentage: total > 0 ? Math.round((severityCounts.Minor / total) * 100) : 0, color: '#10b981' },
      { name: 'Major', value: severityCounts.Major, percentage: total > 0 ? Math.round((severityCounts.Major / total) * 100) : 0, color: '#f59e0b' },
      { name: 'Severe', value: severityCounts.Severe, percentage: total > 0 ? Math.round((severityCounts.Severe / total) * 100) : 0, color: '#ef4444' },
    ].filter(item => item.value > 0); // Only show slices with values
    setSeverityChartData(chartData);
  };

  const updateRecentRecords = useCallback(async (records: any[]) => {
    const sortedRecords = records.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    const totalPagesCount = Math.ceil(sortedRecords.length / recordsPerPage);
    setTotalPages(totalPagesCount);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setRecentRecords(sortedRecords.slice(startIndex, endIndex));
  }, [currentPage]);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentSection === 'dashboard') {
      updateDashboard();
    }
  }, [currentPage, isLoggedIn, currentSection, updateDashboard]);

  // --- Add Record Section ---
  const setCurrentDateTime = () => {
    const now = new Date();
    setRecordDate(now.toISOString().split('T')[0]);
    setRecordTime(now.toTimeString().split(':').slice(0, 2).join(':'));
  };

  useEffect(() => {
    if (isLoggedIn && currentSection === 'add-record') {
      setCurrentDateTime();
    }
  }, [isLoggedIn, currentSection]);

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
      await updateDashboard();
      await updateReportSummary();
    } catch (error) {
      console.error('Error saving record:', error);
      showAlert('Failed to save record. Please try again.', 'error');
    }
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
      await updateDashboard();
      await updateReportSummary();
    } catch (error) {
      console.error('Error updating record:', error);
      showAlert('Failed to update record. Please try again.', 'error');
    }
  };

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
  const loadCustomViolations = async () => {
    const savedViolations = await db.getSetting('customViolations') || [];
    setCustomViolations(savedViolations);
  };

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
        await updateDashboard();
        await updateReportSummary();
      }
    } catch (error) {
      console.error('CSV import error:', error);
      showAlert('Failed to import CSV file. Please check the file format.', 'error');
    }
    e.target.value = ''; // Clear file input
  };

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
  }, []);

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
    switchSection('add-record');
  };

  const deleteRecord = async (recordId: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const transaction = db.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      await store.delete(recordId);
      showAlert('Record deleted!', 'success');
      await updateDashboard();
      await updateReportSummary();
      renderSearchResults(searchQuery); // Refresh search results if applicable
    } catch (error) {
      console.error('Error deleting record:', error);
      showAlert('Failed to delete record.', 'error');
    }
  };

  // --- Reports Section ---
  const updateReportSummary = useCallback(async () => {
    const records = await db.getAllRecords();
    const now = new Date();

    const daily = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate.toDateString() === now.toDateString();
    }).length;
    setDailyCount(daily);

    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekly = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate >= weekStart;
    }).length;
    setWeeklyCount(weekly);

    const monthly = records.filter(r => {
      const recordDate = new Date(r.dateTime);
      return recordDate.getMonth() === now.getMonth() &&
             recordDate.getFullYear() === now.getFullYear();
    }).length;
    setMonthlyCount(monthly);
  }, []);

  const getFilteredRecords = async () => {
    const records = await db.getAllRecords();
    let filteredRecords = records;

    if (reportViolationType) {
      filteredRecords = filteredRecords.filter(r => r.violationType === reportViolationType);
    }

    const now = new Date();
    if (reportType === 'daily') {
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate.toDateString() === now.toDateString();
      });
    } else if (reportType === 'weekly') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate >= weekStart;
      });
    } else if (reportType === 'monthly') {
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.dateTime);
        return recordDate.getMonth() === now.getMonth() &&
               recordDate.getFullYear() === now.getFullYear();
      });
    } else if (reportType === 'custom') {
      if (reportFromDate && reportToDate) {
        filteredRecords = filteredRecords.filter(r => {
          const recordDate = new Date(r.dateTime);
          return recordDate >= new Date(reportFromDate) && recordDate <= new Date(reportToDate);
        });
      }
    }
    return filteredRecords.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  };

  const generateReport = async () => {
    const records = await getFilteredRecords();
    if (reportFormat === 'pdf') {
      await generatePDFReport(records);
    } else if (reportFormat === 'csv') {
      await exportCSV(records);
    } else if (reportFormat === 'print') {
      await generatePrintPreview(records);
    }
  };

  const generatePDFReport = async (records: any[]) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;

      if (logoData) {
        try {
          pdf.addImage(logoData, 'JPEG', 85, yPosition, 40, 40);
          yPosition += 50;
        } catch (e) {
          console.log('Could not add logo to PDF');
        }
      }

      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text(schoolName, 105, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text('E-Guidance Record System Report', 105, yPosition, { align: 'center' });
      yPosition += 15;
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Total Records: ${records.length}`, 190, yPosition, { align: 'right' });
      yPosition += 10;

      const headers = ['#', 'NAME', 'TYPE', 'GRADE', 'VIOLATION', 'DATE & TIME', 'DETAILS'];
      const colWidths = [15, 40, 25, 25, 35, 30, 40];
      const colPositions = [10];
      for (let i = 0; i < colWidths.length - 1; i++) {
        colPositions.push(colPositions[i] + colWidths[i]);
      }

      pdf.setFillColor(248, 249, 250);
      pdf.rect(10, yPosition, 190, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, colPositions[index] + 2, yPosition + 5);
      });
      pdf.setLineWidth(0.5);
      pdf.rect(10, yPosition, 190, 8);
      yPosition += 8;

      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      records.forEach((record, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        const rowData = [
          (index + 1).toString(),
          record.name,
          record.type,
          record.gradeLevel || 'N/A',
          record.violationType,
          `${new Date(record.dateTime).toLocaleDateString()}\n${new Date(record.dateTime).toLocaleTimeString()}`,
          record.details || 'N/A'
        ];
        const rowHeight = 12;
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(10, yPosition, 190, rowHeight, 'F');
        }
        rowData.forEach((data, colIndex) => {
          const lines = pdf.splitTextToSize(data, colWidths[colIndex] - 4);
          lines.forEach((line, lineIndex) => {
            pdf.text(line, colPositions[colIndex] + 2, yPosition + 5 + (lineIndex * 4));
          });
        });
        yPosition += rowHeight;
      });

      yPosition += 20;
      const signaturePositions = [40, 80, 120, 160];
      const officers = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ];
      officers.forEach((officer, index) => {
        if (officer.name) {
          pdf.setFont(undefined, 'bold');
          pdf.text(officer.name.toUpperCase(), signaturePositions[index], yPosition, { align: 'center' });
          pdf.line(signaturePositions[index] - 30, yPosition + 2, signaturePositions[index] + 30, yPosition + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(officer.title, signaturePositions[index], yPosition + 8, { align: 'center' });
        }
      });

      const fileName = `guidance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('PDF report generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showAlert('Failed to generate PDF report. Please try again.', 'error');
    }
  };

  const exportCSV = async (records: any[]) => {
    const headers = ['Name', 'Type', 'Grade Level', 'Violation Type', 'Date', 'Time', 'Details'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        `"${record.name}"`,
        `"${record.type}"`,
        `"${record.gradeLevel || ''}"`,
        `"${record.violationType}"`,
        `"${new Date(record.dateTime).toLocaleDateString()}"`,
        `"${new Date(record.dateTime).toLocaleTimeString()}"`,
        `"${record.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guidance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('CSV report exported successfully!', 'success');
  };

  const generatePrintPreview = async (records: any[]) => {
    const content = `
      <div class="print-header text-center mb-12 border-b-2 border-gray-300 pb-8">
          ${logoData ? `<img src="${logoData}" class="print-logo w-24 h-24 rounded-xl object-cover mx-auto mb-4 border-2 border-gray-300" alt="School Logo">` : ''}
          <h1 class="text-3xl font-bold text-gray-900">${schoolName}</h1>
          <h2 class="text-xl text-gray-700 mt-2">E-Guidance Record System Report</h2>
          <div class="text-lg text-gray-600 mt-4">Total Records: ${records.length}</div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse mt-4 bg-white rounded-lg shadow-sm">
            <thead>
                <tr class="bg-gray-100 text-gray-700 text-sm uppercase font-semibold tracking-wider">
                    <th class="py-3 px-4 text-left">#</th>
                    <th class="py-3 px-4 text-left">NAME</th>
                    <th class="py-3 px-4 text-left">TYPE</th>
                    <th class="py-3 px-4 text-left">GRADE</th>
                    <th class="py-3 px-4 text-left">VIOLATION</th>
                    <th class="py-3 px-4 text-left">DATE & TIME</th>
                    <th class="py-3 px-4 text-left">DETAILS</th>
                </tr>
            </thead>
            <tbody>
                ${records.map((record, index) => `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="py-3 px-4">${index + 1}</td>
                        <td class="py-3 px-4 font-medium text-gray-800">${record.name}</td>
                        <td class="py-3 px-4"><span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${record.type}</span></td>
                        <td class="py-3 px-4">${record.gradeLevel || 'N/A'}</td>
                        <td class="py-3 px-4">${record.violationType}</td>
                        <td class="py-3 px-4">
                            ${new Date(record.dateTime).toLocaleDateString()}<br>
                            ${new Date(record.dateTime).toLocaleTimeString()}
                        </td>
                        <td class="py-3 px-4 text-gray-600">${record.details || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
      </div>
      <div class="flex justify-between mt-16 gap-16 px-8 print:flex-wrap print:gap-8">
          ${guidanceOfficer ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidanceOfficer.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
              </div>
          ` : ''}
          ${cpcGuidanceOfficerName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpcGuidanceOfficerName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
              </div>
          ` : ''}
          ${principalName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principalName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Principal</div>
              </div>
          ` : ''}
          ${assistantPrincipalName ? `
              <div class="flex-1 text-center min-w-[200px]">
                  <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistantPrincipalName.toUpperCase()}</div>
                  <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                  <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
              </div>
          ` : ''}
      </div>
    `;
    setReportPreviewContent(content);
    showAlert('Print preview generated!', 'success');
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Report Print Preview</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: sans-serif; margin: 0; padding: 0; }
              .print-header { text-align: center; margin-bottom: 3rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 2rem; }
              .print-logo { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; margin: 0 auto 1rem; display: block; border: 2px solid #e5e7eb; }
              h1 { font-size: 24pt; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937; }
              h2 { font-size: 16pt; margin-bottom: 1rem; color: #4b5563; }
              .total-records { font-size: 12pt; color: #6b7280; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: auto; }
              th, td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
              th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #fcfcfc; }
              .print-signatures { margin-top: 4rem; display: flex; justify-content: space-between; page-break-inside: avoid; gap: 4rem; padding: 0 2rem; }
              .signature-block { text-align: center; min-width: 200px; flex: 1; }
              .signature-name { font-weight: bold; color: #000; margin-bottom: 0.5rem; font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; }
              .signature-line { border-bottom: 2px solid #000; margin-bottom: 0.5rem; height: 50px; width: 100%; }
              .signature-title { font-weight: 600; color: #000; font-size: 11pt; margin-top: 0.5rem; }
            </style>
          </head>
          <body>
            ${reportPreviewContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // --- Settings Section ---
  const loadSettings = async () => {
    const savedSchoolName = await db.getSetting('schoolName') || 'Sample Elementary School';
    const savedCustomPhrase = await db.getSetting('customPhrase') || 'add custom phrase here:';
    const savedLogoData = await db.getSetting('logoData');
    const savedGuidanceOfficer = await db.getSetting('guidanceOfficer') || '';
    const savedCpcOfficer = await db.getSetting('cpcGuidanceOfficerName') || '';
    const savedPrincipal = await db.getSetting('principalName') || '';
    const savedAssistantPrincipal = await db.getSetting('assistantPrincipalName') || '';
    const savedTheme = await db.getSetting('theme') || 'default';

    setSchoolName(savedSchoolName);
    setCustomPhrase(savedCustomPhrase);
    setLogoData(savedLogoData);
    setGuidanceOfficer(savedGuidanceOfficer);
    setCpcGuidanceOfficerName(savedCpcOfficer);
    setPrincipalName(savedPrincipal);
    setAssistantPrincipalName(savedAssistantPrincipal);
    setCurrentTheme(savedTheme);
  };

  const saveSettings = async () => {
    await db.setSetting('schoolName', schoolName);
    await db.setSetting('customPhrase', customPhrase);
    await db.setSetting('guidanceOfficer', guidanceOfficer);
    await db.setSetting('cpcGuidanceOfficerName', cpcGuidanceOfficerName);
    await db.setSetting('principalName', principalName);
    await db.setSetting('assistantPrincipalName', assistantPrincipalName);
    await db.setSetting('theme', currentTheme);
    showAlert('Settings saved successfully!', 'success');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAlert('File size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as string;
      setLogoData(data);
      await db.setSetting('logoData', data);
      showAlert('Logo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'type', 'gradeLevel', 'violationType', 'date', 'time', 'details'],
      ['John Doe', 'student', 'Grade 10', 'Late Arrival', '2024-01-15', '08:30', 'Student arrived 30 minutes late'],
      ['Jane Smith', 'student', 'Grade 9', 'Uniform Violation', '2024-01-15', '09:00', 'Missing school ID'],
      ['Bob Johnson', 'teacher', '', 'Other', '2024-01-15', '10:15', 'Parking violation']
    ];
    const csvContent = sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import.csv';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Sample CSV downloaded!', 'success');
  };

  const changePasswords = async () => {
    if (currentUserRole !== 'superadmin') {
      showAlert('Only Super Admin can change passwords!', 'error');
      return;
    }
    if (!adminPasswordInput && !superAdminPasswordInput) {
      showAlert('Please enter at least one new password', 'error');
      return;
    }
    const updatedPasswords = { ...appPasswords };
    if (adminPasswordInput) {
      updatedPasswords.admin = adminPasswordInput;
    }
    if (superAdminPasswordInput) {
      updatedPasswords.superadmin = superAdminPasswordInput;
    }
    setAppPasswords(updatedPasswords);
    await db.setSetting('passwords', updatedPasswords);
    setAdminPasswordInput('');
    setSuperAdminPasswordInput('');
    showAlert('Passwords changed successfully!', 'success');
  };

  const deleteAllRecords = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL records?\nThis action cannot be undone!')) {
      return;
    }
    try {
      const transaction = db.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.clear();
      request.onsuccess = () => {
        showAlert('✅ All records deleted successfully!', 'success');
        updateDashboard();
        updateReportSummary();
        setSearchQuery('');
        setSearchResults([]);
      };
      request.onerror = () => {
        showAlert('❌ Failed to delete records.', 'error');
      };
    } catch (error) {
      console.error('Delete all error:', error);
      showAlert('An error occurred while deleting records.', 'error');
    }
  };

  // --- Good Moral Certificate Section ---
  const loadCertificateSettings = async () => {
    const savedTemplate = await db.getSetting('certificateTemplate') || 'standard';
    const savedCustomContent = await db.getSetting('customCertificateContent') || '';
    const savedCertificateDate = await db.getSetting('certificateDate') || new Date().toISOString().split('T')[0];
    setCertificateTemplate(savedTemplate);
    setCustomCertificateContent(savedCustomContent);
    setCertificateDate(savedCertificateDate);
  };

  const generateCertificateContent = async (studentName: string, certDate: string, isPreview = false) => {
    const school = await db.getSetting('schoolName') || 'Sample Elementary School';
    const logo = await db.getSetting('logoData');
    const guidance = await db.getSetting('guidanceOfficer') || '';
    const cpc = await db.getSetting('cpcGuidanceOfficerName') || '';
    const principal = await db.getSetting('principalName') || '';
    const assistant = await db.getSetting('assistantPrincipalName') || '';

    let content = '';
    if (certificateTemplate === 'standard') {
      content = `
        <div class="text-center mb-12 border-b-2 border-gray-300 pb-8">
            ${logo ? `<img src="${logo}" class="w-32 h-32 rounded-xl object-cover mx-auto mb-4 border-2 border-gray-300" alt="School Logo">` : ''}
            <div class="text-3xl font-bold text-gray-900 uppercase">${school}</div>
            <div class="text-xl text-gray-700 mt-2">Office of Student Affairs</div>
        </div>
        <div class="text-2xl font-bold text-gray-900 uppercase tracking-wider text-center my-8">CERTIFICATE OF GOOD MORAL CHARACTER</div>
        <div class="text-lg text-gray-800 text-justify my-8 leading-relaxed">
            <p>TO WHOM IT MAY CONCERN:</p>
            <p class="mt-8">This is to certify that <span class="font-bold underline text-black">${studentName.toUpperCase()}</span>,
            a student of this institution, has maintained good moral character and conduct during his/her stay in this school.</p>
            <p class="mt-6">He/She has not been involved in any disciplinary case that would affect his/her moral character
            and reputation. This student has shown respect to school authorities, faculty members, and fellow students.</p>
            <p class="mt-6">This certification is issued upon the request of the above-mentioned student
            for whatever legal purpose it may serve.</p>
        </div>
        <div class="text-right mt-8 text-lg text-gray-800">
            Issued this ${new Date(certDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}.
        </div>
        <div class="flex justify-between mt-16 gap-16 px-8 print:flex-wrap print:gap-8">
            ${guidance ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidance.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
                </div>
            ` : ''}
            ${cpc ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpc.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
                </div>
            ` : ''}
            ${principal ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principal.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Principal</div>
                </div>
            ` : ''}
            ${assistant ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistant.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
                </div>
            ` : ''}
        </div>
      `;
    } else {
      const customText = customCertificateContent ||
        'This is to certify that [STUDENT_NAME] has maintained good moral character during their time at [SCHOOL_NAME].';
      content = `
        <div class="text-center mb-12 border-b-2 border-gray-300 pb-8">
            ${logo ? `<img src="${logo}" class="w-32 h-32 rounded-xl object-cover mx-auto mb-4 border-2 border-gray-300" alt="School Logo">` : ''}
            <div class="text-3xl font-bold text-gray-900 uppercase">${school}</div>
            <div class="text-xl text-gray-700 mt-2">Office of Student Affairs</div>
        </div>
        <div class="text-2xl font-bold text-gray-900 uppercase tracking-wider text-center my-8">CERTIFICATE OF GOOD MORAL CHARACTER</div>
        <div class="text-lg text-gray-800 text-justify my-8 leading-relaxed">
            <p>${customText
                .replace(/\[STUDENT_NAME\]/g, `<span class="font-bold underline text-black">${studentName.toUpperCase()}</span>`)
                .replace(/\[SCHOOL_NAME\]/g, school)
                .replace(/\[DATE\]/g, new Date(certDate).toLocaleDateString())
                .replace(/\n/g, '</p><p>')
            }</p>
        </div>
        <div class="text-right mt-8 text-lg text-gray-800">
            Issued this ${new Date(certDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}.
        </div>
        <div class="flex justify-between mt-16 gap-16 px-8 print:flex-wrap print:gap-8">
            ${guidance ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${guidance.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Guidance Officer</div>
                </div>
            ` : ''}
            ${cpc ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${cpc.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">CPC/Guidance Officer</div>
                </div>
            ` : ''}
            ${principal ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${principal.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Principal</div>
                </div>
            ` : ''}
            ${assistant ? `
                <div class="flex-1 text-center min-w-[200px]">
                    <div class="font-bold text-black text-lg uppercase tracking-wide mb-2">${assistant.toUpperCase()}</div>
                    <div class="border-b-2 border-black h-12 w-full mb-2"></div>
                    <div class="font-semibold text-black text-base mt-2">Assistant Principal</div>
                </div>
            ` : ''}
        </div>
      `;
    }
    setCertificatePreviewHtml(content);
    if (isPreview) {
      showAlert('Certificate preview generated!', 'success');
    }
  };

  const generateCertificatePDF = async () => {
    if (!previewStudentName) {
      showAlert('Please enter a student name for the certificate.', 'error');
      return;
    }
    await generateCertificateContent(previewStudentName, certificateDate, false);

    try {
      const pdf = new jsPDF();
      let yPosition = 30;

      if (logoData) {
        try {
          pdf.addImage(logoData, 'JPEG', 85, yPosition, 40, 40);
          yPosition += 50;
        } catch (e) {
          console.log('Could not add logo to PDF');
        }
      }

      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(schoolName.toUpperCase(), 105, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text('Office of Student Affairs', 105, yPosition, { align: 'center' });
      yPosition += 20;
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('CERTIFICATE OF GOOD MORAL CHARACTER', 105, yPosition, { align: 'center' });
      yPosition += 25;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('TO WHOM IT MAY CONCERN:', 20, yPosition);
      yPosition += 15;

      let bodyText = '';
      if (certificateTemplate === 'standard') {
        bodyText = `This is to certify that ${previewStudentName.toUpperCase()}, a student of this institution, has maintained good moral character and conduct during his/her stay in this school.
He/She has not been involved in any disciplinary case that would affect his/her moral character and reputation. This student has shown respect to school authorities, faculty members, and fellow students.
This certification is issued upon the request of the above-mentioned student for whatever legal purpose it may serve.`;
      } else {
        bodyText = customCertificateContent
          .replace(/\[STUDENT_NAME\]/g, previewStudentName.toUpperCase())
          .replace(/\[SCHOOL_NAME\]/g, schoolName)
          .replace(/\[DATE\]/g, new Date(certificateDate).toLocaleDateString());
      }

      const lines = pdf.splitTextToSize(bodyText, 170);
      lines.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 15;
      pdf.text(`Issued this ${new Date(certificateDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}.`, 150, yPosition, { align: 'right' });
      yPosition += 40;

      const signaturePositions = [40, 80, 120, 160];
      const officers = [
        { name: guidanceOfficer, title: 'Guidance Officer' },
        { name: cpcGuidanceOfficerName, title: 'CPC/Guidance Officer' },
        { name: principalName, title: 'Principal' },
        { name: assistantPrincipalName, title: 'Assistant Principal' }
      ];
      officers.forEach((officer, index) => {
        if (officer.name) {
          pdf.setFont(undefined, 'bold');
          pdf.text(officer.name.toUpperCase(), signaturePositions[index], yPosition, { align: 'center' });
          pdf.line(signaturePositions[index] - 30, yPosition + 2, signaturePositions[index] + 30, yPosition + 2);
          pdf.setFont(undefined, 'normal');
          pdf.text(officer.title, signaturePositions[index], yPosition + 8, { align: 'center' });
        }
      });

      const fileName = `good-moral-certificate-${previewStudentName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      showAlert('Certificate PDF generated successfully!', 'success');
    } catch (error) {
      console.error('Certificate PDF generation error:', error);
      showAlert('Failed to generate certificate PDF. Please try again.', 'error');
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate Print Preview</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; line-height: 1.6; color: #000; }
              .text-center { text-align: center; }
              .mb-12 { margin-bottom: 3rem; }
              .border-b-2 { border-bottom-width: 2px; }
              .border-gray-300 { border-color: #d1d5db; }
              .pb-8 { padding-bottom: 2rem; }
              .w-32 { width: 8rem; }
              .h-32 { height: 8rem; }
              .rounded-xl { border-radius: 0.75rem; }
              .object-cover { object-fit: cover; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .mb-4 { margin-bottom: 1rem; }
              .border-2 { border-width: 2px; }
              .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
              .font-bold { font-weight: 700; }
              .uppercase { text-transform: uppercase; }
              .text-gray-900 { color: #111827; }
              .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
              .text-gray-700 { color: #374151; }
              .mt-2 { margin-top: 0.5rem; }
              .text-2xl { font-size: 1.5rem; line-height: 2rem; }
              .tracking-wider { letter-spacing: 0.05em; }
              .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
              .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
              .text-gray-800 { color: #1f2937; }
              .text-justify { text-align: justify; }
              .leading-relaxed { line-height: 1.625; }
              .mt-8 { margin-top: 2rem; }
              .font-bold { font-weight: 700; }
              .underline { text-decoration: underline; }
              .text-black { color: #000; }
              .mt-6 { margin-top: 1.5rem; }
              .text-right { text-align: right; }
              .mt-16 { margin-top: 4rem; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .gap-16 { gap: 4rem; }
              .px-8 { padding-left: 2rem; padding-right: 2rem; }
              .flex-1 { flex: 1 1 0%; }
              .min-w-\[200px\] { min-width: 200px; }
              .tracking-wide { letter-spacing: 0.025em; }
              .mb-2 { margin-bottom: 0.5rem; }
              .border-b-2 { border-bottom-width: 2px; }
              .h-12 { height: 3rem; }
              .w-full { width: 100%; }
              .font-semibold { font-weight: 600; }
              .mt-2 { margin-top: 0.5rem; }
            </style>
          </head>
          <body>
            ${certificatePreviewHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // --- Modals ---
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [modalPhotoSrc, setModalPhotoSrc] = useState<string | null>(null);

  const showPhoto = (photoData: string) => {
    setModalPhotoSrc(photoData);
    setIsPhotoModalOpen(true);
  };

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const confirmActionRef = useRef<(() => void) | null>(null);

  const showConfirmModal = (message: string, onConfirm: () => void) => {
    setConfirmMessage(message);
    confirmActionRef.current = onConfirm;
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    if (confirmActionRef.current) {
      confirmActionRef.current();
    }
    setIsConfirmModalOpen(false);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  // --- Theming ---
  useEffect(() => {
    const root = document.documentElement;
    const themes: { [key: string]: { [key: string]: string } } = {
      default: {
        '--primary': '222.2 47.4% 11.2%', '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96.1%', '--secondary-foreground': '222.2 47.4% 11.2%',
        '--sidebar-background': '0 0% 98%', '--sidebar-foreground': '240 5.3% 26.1%',
        '--sidebar-primary': '240 5.9% 10%', '--sidebar-primary-foreground': '0 0% 98%',
        '--sidebar-accent': '240 4.8% 95.9%', '--sidebar-accent-foreground': '240 5.9% 10%',
        '--sidebar-border': '220 13% 91%', '--sidebar-ring': '217.2 91.2% 59.8%',
      },
      green: {
        '--primary': '142.1 76.2% 36.3%', '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '142.1 76.2% 36.3% / 0.1', '--secondary-foreground': '142.1 76.2% 36.3%',
        '--sidebar-background': '142.1 76.2% 36.3%', '--sidebar-foreground': '0 0% 98%',
        '--sidebar-primary': '142.1 76.2% 36.3%', '--sidebar-primary-foreground': '0 0% 98%',
        '--sidebar-accent': '142.1 76.2% 36.3% / 0.1', '--sidebar-accent-foreground': '142.1 76.2% 36.3%',
        '--sidebar-border': '142.1 76.2% 36.3% / 0.2', '--sidebar-ring': '142.1 76.2% 36.3%',
      },
      purple: {
        '--primary': '262.1 83.3% 57.8%', '--primary-foreground': '210 40% 98%',
        '--secondary': '262.1 83.3% 57.8% / 0.1', '--secondary-foreground': '262.1 83.3% 57.8%',
        '--sidebar-background': '262.1 83.3% 57.8%', '--sidebar-foreground': '210 40% 98%',
        '--sidebar-primary': '262.1 83.3% 57.8%', '--sidebar-primary-foreground': '210 40% 98%',
        '--sidebar-accent': '262.1 83.3% 57.8% / 0.1', '--sidebar-accent-foreground': '262.1 83.3% 57.8%',
        '--sidebar-border': '262.1 83.3% 57.8% / 0.2', '--sidebar-ring': '262.1 83.3% 57.8%',
      },
    };

    const selectedTheme = themes[currentTheme];
    if (selectedTheme) {
      for (const [key, value] of Object.entries(selectedTheme)) {
        root.style.setProperty(key, value);
      }
    }
  }, [currentTheme]);


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md m-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
              🔐 E-Guidance
            </h1>
            <p className="text-gray-600 text-lg">Secure Access Required</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl mb-6 text-sm text-center">
            ⚠️ This system is protected by authentication. Unauthorized access is prohibited.
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <Label htmlFor="accessLevel" className="block text-gray-700 text-sm font-semibold mb-2">
                Access Level
              </Label>
              <Select value={accessLevel} onValueChange={setAccessLevel} required>
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                  <SelectValue placeholder="Select Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Access</SelectItem>
                  <SelectItem value="superadmin">Super Admin Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-6">
              <Label htmlFor="loginPassword" className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <Button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              🔓 Login
            </Button>
          </form>
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            Protected by Advanced Security System<br />
            <strong>Default Login:</strong> Admin - ******** | Super Admin - ********
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-white/20 border border-white/30 rounded-xl p-3 text-sm font-medium backdrop-blur-sm min-w-[200px] text-center md:text-left">
            {customPhrase}
          </div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl md:text-3xl font-bold mb-1">E-Guidance Record System</div>
          <div className="text-sm md:text-base opacity-90">Strengthening Schools Through Smart Record Management</div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-1">
          <div className="bg-white/20 border border-white/30 rounded-xl p-3 text-right backdrop-blur-sm min-w-[180px]">
            <div className="text-xl md:text-2xl font-bold text-white/90">{currentTime}</div>
            <div className="text-lg md:text-xl text-white/80 font-bold">{currentDate}</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 shadow-sm">
        <Button
          variant={currentSection === "dashboard" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "dashboard" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-yellow-400 hover:bg-yellow-500 text-white"}`}
          onClick={() => switchSection("dashboard")}
        >
          📊 Dashboard
        </Button>
        <Button
          variant={currentSection === "add-record" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "add-record" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-orange-400 hover:bg-orange-500 text-white"}`}
          onClick={() => switchSection("add-record")}
        >
          ➕ Add Record
        </Button>
        <Button
          variant={currentSection === "reports" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "reports" ? "bg-pink-600 hover:bg-pink-700 text-white" : "bg-pink-500 hover:bg-pink-600 text-white"}`}
          onClick={() => switchSection("reports")}
        >
          📄 Reports
        </Button>
        <Button
          variant={currentSection === "settings" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "settings" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
          onClick={() => switchSection("settings")}
        >
          ⚙️ Settings
        </Button>
        <Button
          variant={currentSection === "about-egrs" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "about-egrs" ? "bg-lime-600 hover:bg-lime-700 text-white" : "bg-lime-500 hover:bg-lime-600 text-white"}`}
          onClick={() => switchSection("about-egrs")}
        >
          🧾 About eGRS
        </Button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-180px)]">
        {/* Dashboard Section */}
        {currentSection === "dashboard" && (
          <section id="dashboard" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
              <img
                id="dashboardLogo"
                className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                src={logoData || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTIiIGZpbGw9IiM0ZjQ2ZTUiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0xNCAyLTMgMyAyLjUgMi41TDEwIDExbDMgMyA0LTQgMi41IDIuNUwyMiA5eiIvPgo8cGF0aCBkPSJtNSAxMS0zIDNMMTAgMjIgMTMgMTkgNS41IDExLjVaIi8+CjxwYXRoIGQ9Im0yIDEzIDMgM0w5IDEyIDYgOXoiLz4KPC9zdmc+Cjwvc3ZnPgo="}
                alt="School Logo"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{schoolName}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Rizal Street, Brgy. III, Poblacion, Pontevedra, Negros Occidental</p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  {currentUserRole === 'superadmin' ? 'Super Admin' : 'Admin'}
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsLoggedIn(false);
                    setCurrentUserRole(null);
                    showAlert('Logged out successfully', 'info');
                  }}
                  className="px-4 py-2 text-sm"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2">{totalRecords}</div>
                <div className="text-lg opacity-90">Total Records</div>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2">{totalStudents}</div>
                <div className="text-lg opacity-90">Students Involved</div>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2">{thisMonthRecords}</div>
                <div className="text-lg opacity-90">This Month</div>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2">{lastEntryDate}</div>
                <div className="text-lg opacity-90">Last Entry</div>
              </Card>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <Card className="flex-1 p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Violation Types</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">Distribution of violation severity</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={violationChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" className="text-xs text-gray-600 dark:text-gray-300" />
                    <YAxis className="text-xs text-gray-600 dark:text-gray-300" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: '8px' }}
                      labelStyle={{ color: '#333' }}
                      itemStyle={{ color: '#333' }}
                      formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentage}%)`, name]}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="flex-1 p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Violation Statistics by Severity Level</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">A Breakdown of Minor to Severe Offenses</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: '8px' }}
                      labelStyle={{ color: '#333' }}
                      itemStyle={{ color: '#333' }}
                      formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentage}%)`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">📋 Recent Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm uppercase font-semibold tracking-wider">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Violation</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Photo</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">No records found</td>
                      </tr>
                    ) : (
                      recentRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{record.name}</td>
                          <td className="py-3 px-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                              {record.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{record.violationType}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{new Date(record.dateTime).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {record.photoData ? (
                              <img
                                src={record.photoData}
                                className="w-14 h-14 object-cover rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600 hover:scale-105 transition-transform"
                                onClick={() => showPhoto(record.photoData)}
                                alt="Record"
                              />
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" onClick={() => fillFormFromRecord(record.id)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteRecord(record.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2">
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm"
                >
                  ‹ Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => changePage(page)}
                    className={`px-4 py-2 text-sm ${currentPage === page ? "bg-indigo-600 text-white" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm"
                >
                  Next ›
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Add Record Section */}
        {currentSection === "add-record" && (
          <section id="add-record" className="space-y-6">
            {currentUserRole === 'superadmin' && (
              <Card className="p-6 rounded-2xl shadow-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-center">
                <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Dangerous Operation</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  This will permanently delete <strong>all records</strong>. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={() => showConfirmModal('Are you sure you want to delete ALL records? This action cannot be undone!', deleteAllRecords)} className="px-4 py-2 text-sm">
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
                      <SelectItem value="">Select Grade</SelectItem>
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
                    <SelectItem value="">Select Violation Type</SelectItem>
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
        )}

        {/* Reports Section */}
        {currentSection === "reports" && (
          <section id="reports" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Generate Reports</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="reportType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Report Type
                </Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reportFormat" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Format
                </Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="print">Print Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="reportFromDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                    From Date
                  </Label>
                  <Input
                    id="reportFromDate"
                    type="date"
                    value={reportFromDate}
                    onChange={(e) => setReportFromDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="reportToDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                    To Date
                  </Label>
                  <Input
                    id="reportToDate"
                    type="date"
                    value={reportToDate}
                    onChange={(e) => setReportToDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reportViolationType" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Filter by Violation Type
              </Label>
              <Select value={reportViolationType} onValueChange={setReportViolationType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
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
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <Button onClick={generateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
                📄 Generate Report
              </Button>
              {reportPreviewContent && (
                <Button variant="secondary" onClick={printReport} className="px-6 py-3 rounded-lg">
                  🖨️ Print
                </Button>
              )}
            </div>

            {reportPreviewContent && (
              <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Report Preview</h3>
                <div dangerouslySetInnerHTML={{ __html: reportPreviewContent }} className="prose dark:prose-invert max-w-none" />
              </Card>
            )}
          </section>
        )}

        {/* About eGRS Section */}
        {currentSection === "about-egrs" && (
          <section id="about-egrs" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">🧾 About E-Guidance Record System (eGRS)</h2>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The <strong>E-Guidance Record System (eGRS)</strong> is a school-based digital platform created to streamline the
              management of guidance and behavioral records. It helps administrators and guidance personnel securely record,
              organize, and analyze student-related data with ease and accuracy.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This app promotes <strong>smart record management</strong> by providing tools for secure login access, record tracking,
              and automatic report generation — empowering schools to make informed decisions through data-driven insights.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">⚙️ Main Features</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Dashboard Overview:</strong> Displays total records, recent entries, and violation statistics.</li>
              <li><strong>Add Record Module:</strong> Allows easy input of student or teacher incidents with photo attachments.</li>
              <li><strong>Report Generator:</strong> Creates daily, weekly, and monthly summaries in PDF or CSV format.</li>
              <li><strong>Smart Charts:</strong> Visual breakdown of violation types and severity levels.</li>
              <li><strong>Customizable Settings:</strong> Upload school logo, change themes, and personalize dashboard text.</li>
              <li><strong>Secure Access Control:</strong> Two-level authentication (Admin and Super Admin).</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">📱 How to Use</h3>
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Login:</strong> Enter access level and password to enter the system.</li>
              <li><strong>Add Records:</strong> Input name, date, grade level, and violation details.</li>
              <li><strong>Attach Photos:</strong> Use the camera integration for visual documentation.</li>
              <li><strong>View Dashboard:</strong> Monitor statistics and latest entries.</li>
              <li><strong>Generate Reports:</strong> Export printable summaries for school documentation.</li>
            </ol>

            <Card className="p-6 rounded-2xl shadow-md bg-gray-100 dark:bg-gray-800 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">👨‍💻 Developer Credits</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Developer:</strong> Guided by God’s wisdom and provision<br />
                <strong>Programmer & Planner:</strong> <em>Jonathan V. Quitco</em><br />
                <strong>Glory & Praise:</strong> Belongs to Him alone 🙏
              </p>
              <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
                Proverbs 16:3 — “Commit thy works unto the Lord and thy plans will succeed.”
              </p>
            </Card>
          </section>
        )}

        {/* Settings Section */}
        {currentSection === "settings" && (
          <section id="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>

            <div>
              <Label htmlFor="settingsSchoolName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                School Name
              </Label>
              <Textarea
                id="settingsSchoolName"
                placeholder="Enter your school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                rows={2}
                className="w-full min-h-[60px]"
              />
            </div>

            <div>
              <Label htmlFor="customPhrase" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                Custom Phrase
              </Label>
              <Input
                id="customPhrase"
                type="text"
                placeholder="Enter custom phrase for header"
                value={customPhrase}
                onChange={(e) => setCustomPhrase(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="logoUpload" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                School Logo
              </Label>
              <div
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
                onClick={() => document.getElementById('logoFileInput')?.click()}
              >
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">📁 Click to upload school logo</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Recommended: PNG or JPG, max 2MB</div>
              </div>
              <Input type="file" id="logoFileInput" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              {logoData && (
                <img src={logoData} className="max-w-[200px] mt-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700" alt="Logo Preview" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="guidanceOfficer" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Guidance Officer Name
                </Label>
                <Input
                  id="guidanceOfficer"
                  type="text"
                  placeholder="Officer name for reports"
                  value={guidanceOfficer}
                  onChange={(e) => setGuidanceOfficer(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="cpcGuidanceOfficerName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  CPC/Guidance Officer Name
                </Label>
                <Input
                  id="cpcGuidanceOfficerName"
                  type="text"
                  placeholder="CPC/Guidance Officer name for reports"
                  value={cpcGuidanceOfficerName}
                  onChange={(e) => setCpcGuidanceOfficerName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="principalName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Principal Name
                </Label>
                <Input
                  id="principalName"
                  type="text"
                  placeholder="Principal name for reports"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="assistantPrincipalName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Assistant Principal Name
                </Label>
                <Input
                  id="assistantPrincipalName"
                  type="text"
                  placeholder="Assistant Principal name for reports"
                  value={assistantPrincipalName}
                  onChange={(e) => setAssistantPrincipalName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
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

            <div className="flex flex-wrap gap-4 mt-8">
              <Button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
                💾 Save Settings
              </Button>
              <Button variant="secondary" onClick={downloadSampleCSV} className="px-6 py-3 rounded-lg">
                📄 Download Sample CSV
              </Button>
            </div>

            {currentUserRole === 'superadmin' && (
              <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">🔒 Change Passwords</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="adminPassword" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                      Admin Password
                    </Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="New admin password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="superAdminPassword" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                      Super Admin Password
                    </Label>
                    <Input
                      id="superAdminPassword"
                      type="password"
                      placeholder="New super admin password"
                      value={superAdminPasswordInput}
                      onChange={(e) => setSuperAdminPasswordInput(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button variant="destructive" onClick={changePasswords} className="mt-6 px-6 py-3 rounded-lg">
                  🔐 Change Passwords
                </Button>
              </Card>
            )}

            <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">📜 Good Moral Certificate</h3>
              <div>
                <Label htmlFor="certificateTemplate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                  Certificate Template
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'standard' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                    onClick={() => {
                      setCertificateTemplate('standard');
                      db.setSetting('certificateTemplate', 'standard');
                    }}
                  >
                    <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">📄 Standard Template</div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">Professional format with school logo</div>
                  </Card>
                  <Card
                    className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all ${certificateTemplate === 'custom' ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                    onClick={() => {
                      setCertificateTemplate('custom');
                      db.setSetting('certificateTemplate', 'custom');
                    }}
                  >
                    <div className="text-center font-medium text-gray-800 dark:text-gray-100 mb-1">✏️ Custom Template</div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">Editable content and format</div>
                  </Card>
                </div>
              </div>

              {certificateTemplate === 'custom' && (
                <div className="mt-6">
                  <Label htmlFor="customCertificateContent" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                    Custom Certificate Content
                  </Label>
                  <Textarea
                    id="customCertificateContent"
                    placeholder="Enter your custom certificate content. Use [STUDENT_NAME], [SCHOOL_NAME], and [DATE] as placeholders..."
                    value={customCertificateContent}
                    onChange={(e) => {
                      setCustomCertificateContent(e.target.value);
                      db.setSetting('customCertificateContent', e.target.value);
                    }}
                    className="w-full min-h-[200px]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Label htmlFor="previewStudentName" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                    Student Name (for preview)
                  </Label>
                  <Input
                    id="previewStudentName"
                    type="text"
                    placeholder="Enter student name for preview"
                    value={previewStudentName}
                    onChange={(e) => setPreviewStudentName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="certificateDate" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
                    Certificate Date
                  </Label>
                  <Input
                    id="certificateDate"
                    type="date"
                    value={certificateDate}
                    onChange={(e) => {
                      setCertificateDate(e.target.value);
                      db.setSetting('certificateDate', e.target.value);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <Button onClick={() => generateCertificateContent(previewStudentName, certificateDate, true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md">
                  👁️ Preview Certificate
                </Button>
                <Button variant="success" onClick={generateCertificatePDF} className="px-6 py-3 rounded-lg">
                  📜 Generate Certificate
                </Button>
                {certificatePreviewHtml && (
                  <Button variant="secondary" onClick={printCertificate} className="px-6 py-3 rounded-lg">
                    🖨️ Print Certificate
                  </Button>
                )}
              </div>

              {certificatePreviewHtml && (
                <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Certificate Preview</h3>
                  <div dangerouslySetInnerHTML={{ __html: certificatePreviewHtml }} className="prose dark:prose-invert max-w-none" />
                </Card>
              )}
            </Card>
          </section>
        )}
      </main>

      {/* Modals */}
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

      <MadeWithDyad />
    </div>
  );
};