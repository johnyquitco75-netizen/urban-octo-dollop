"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import LoginScreen from "@/components/LoginScreen";
import PhotoModal from "@/components/modals/PhotoModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

// Placeholder for future modular components
const DashboardSection = React.lazy(() => import("@/components/dashboard/DashboardSection"));
const AddRecordSection = React.lazy(() => import("@/components/records/AddRecordSection"));
const ReportsSection = React.lazy(() => import("@/components/reports/ReportsSection"));
const SettingsSection = React.lazy(() => import("@/components/settings/SettingsSection"));
const CertificateSection = React.lazy(() => import("@/components/certificates/CertificateSection"));
const AboutEGRSSection = React.lazy(() => import("@/components/AboutEGRSSection"));


export const PwaApp = () => {
  const {
    isLoggedIn, setIsLoggedIn,
    currentUserRole, setCurrentUserRole,
    schoolName, customPhrase, logoData,
    showAlert,
    isAppInitialized,
    currentSection, setCurrentSection, // Get from context
  } = useAppContext();

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  // currentSection state moved to AppContext

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
    if (isLoggedIn && isAppInitialized) { // Only update date/time if logged in AND app is initialized
      updateDateTime();
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isAppInitialized, updateDateTime]); // Added isAppInitialized to dependency array

  // --- Navigation ---
  const switchSection = (sectionName: string) => {
    setCurrentSection(sectionName);
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (!isAppInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Loading Application...</h1>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we prepare your data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Removed crystal box styling for custom phrase */}
          <div className="text-sm font-medium min-w-[200px] text-center md:text-left">
            {customPhrase}
          </div>
        </div>
        <div className="text-center flex-1">
          <div className="text-2xl md:text-3xl font-bold mb-1">E-Guidance Record System</div>
          <div className="text-sm md:text-base opacity-90">Strengthening Schools Through Smart Record Management</div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2 flex-1">
          <div className="p-3 text-right min-w-[180px]">
            <div className="text-xl md:text-2xl font-bold text-white">{currentTime}</div>
            <div className="text-lg md:text-xl text-white/90 font-bold">{currentDate}</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 shadow-sm">
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "dashboard" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("dashboard")}
        >
          📊 Dashboard
        </Button>
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "add-record" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("add-record")}
        >
          ➕ Add Record
        </Button>
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "reports" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("reports")}
        >
          📄 Reports
        </Button>
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "settings" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("settings")}
        >
          ⚙️ Settings
        </Button>
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "certificates" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("certificates")}
        >
          📜 Certificates
        </Button>
        <Button
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "about-egrs" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          variant="ghost"
          onClick={() => switchSection("about-egrs")}
        >
          🧾 About eGRS
        </Button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-180px)]">
        <React.Suspense fallback={<div>Loading...</div>}>
          {currentSection === "dashboard" && <DashboardSection />}
          {currentSection === "add-record" && <AddRecordSection />}
          {currentSection === "reports" && <ReportsSection />}
          {currentSection === "settings" && <SettingsSection />}
          {currentSection === "certificates" && <CertificateSection />}
          {currentSection === "about-egrs" && <AboutEGRSSection />}
        </React.Suspense>
      </main>

      <PhotoModal />
      <ConfirmModal />
      <PwaInstallPrompt />
    </div>
  );
};