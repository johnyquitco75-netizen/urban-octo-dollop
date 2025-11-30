"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import LoginScreen from "@/components/LoginScreen";
import PhotoModal from "@/components/modals/PhotoModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import PwaInstallPrompt from "@/components/PwaInstallPrompt"; // Import the new component

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
    loadSettings, loadCustomViolations,
  } = useAppContext();

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentSection, setCurrentSection] = useState("dashboard");

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
      loadSettings();
      loadCustomViolations();
      updateDateTime();
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, updateDateTime, loadSettings, loadCustomViolations]);

  // --- Navigation ---
  const switchSection = (sectionName: string) => {
    setCurrentSection(sectionName);
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
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
          variant={currentSection === "certificates" ? "default" : "outline"}
          className={`flex-1 min-w-[120px] md:flex-none ${currentSection === "certificates" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`}
          onClick={() => switchSection("certificates")}
        >
          📜 Certificates
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
      <PwaInstallPrompt /> {/* Add the PWA install prompt component */}

      <MadeWithDyad />
    </div>
  );
};