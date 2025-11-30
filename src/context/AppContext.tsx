"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/db/DatabaseManager';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  currentUserRole: "admin" | "superadmin" | null;
  setCurrentUserRole: (role: "admin" | "superadmin" | null) => void;
  appPasswords: { admin: string; superadmin: string };
  setAppPasswords: (passwords: { admin: string; superadmin: string }) => void;
  showAlert: (message: string, type: "success" | "error" | "info") => void;
  db: typeof db;
  schoolName: string;
  setSchoolName: (name: string) => void;
  customPhrase: string;
  setCustomPhrase: (phrase: string) => void;
  logoData: string | null;
  setLogoData: (data: string | null) => void;
  guidanceOfficer: string;
  setGuidanceOfficer: (name: string) => void;
  cpcGuidanceOfficerName: string;
  setCpcGuidanceOfficerName: (name: string) => void;
  principalName: string;
  setPrincipalName: (name: string) => void;
  assistantPrincipalName: string;
  setAssistantPrincipalName: (name: string) => void;
  customViolations: string[];
  setCustomViolations: (violations: string[]) => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  loadSettings: () => Promise<void>;
  loadCustomViolations: () => Promise<void>;
  isPhotoModalOpen: boolean;
  setIsPhotoModalOpen: (isOpen: boolean) => void;
  modalPhotoSrc: string | null;
  setModalPhotoSrc: (src: string | null) => void;
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (isOpen: boolean) => void;
  confirmMessage: string;
  setConfirmMessage: (message: string) => void;
  confirmActionRef: React.MutableRefObject<(() => void) | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "superadmin" | null>(null);
  const [appPasswords, setAppPasswords] = useState<{ admin: string; superadmin: string }>({
    admin: 'admin123',
    superadmin: 'superadmin456'
  });

  // Settings state
  const [schoolName, setSchoolName] = useState("Sample Elementary School");
  const [customPhrase, setCustomPhrase] = useState("add custom phrase here:");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [guidanceOfficer, setGuidanceOfficer] = useState("");
  const [cpcGuidanceOfficerName, setCpcGuidanceOfficerName] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [assistantPrincipalName, setAssistantPrincipalName] = useState("");
  const [customViolations, setCustomViolations] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState("default");

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [modalPhotoSrc, setModalPhotoSrc] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const confirmActionRef = useRef<(() => void) | null>(null);

  const showAlert = useCallback((message: string, type: "success" | "error" | "info") => {
    if (type === "success") showSuccess(message);
    else if (type === "error") showError(message);
    else showLoading(message);
    setTimeout(() => dismissToast(), 5000);
  }, []);

  const loadSettings = useCallback(async () => {
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
  }, []);

  const loadCustomViolations = useCallback(async () => {
    const savedViolations = await db.getSetting('customViolations') || [];
    setCustomViolations(savedViolations);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        await db.init();
        const savedPasswords = await db.getSetting('passwords');
        if (savedPasswords) {
          setAppPasswords(savedPasswords);
        }
        await loadSettings();
        await loadCustomViolations();
        showAlert('App loaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('Failed to initialize app. Please refresh the page.', 'error');
      }
    };
    initApp();
  }, [showAlert, loadSettings, loadCustomViolations]);

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


  const value = {
    isLoggedIn, setIsLoggedIn,
    currentUserRole, setCurrentUserRole,
    appPasswords, setAppPasswords,
    showAlert,
    db,
    schoolName, setSchoolName,
    customPhrase, setCustomPhrase,
    logoData, setLogoData,
    guidanceOfficer, setGuidanceOfficer,
    cpcGuidanceOfficerName, setCpcGuidanceOfficerName,
    principalName, setPrincipalName,
    assistantPrincipalName, setAssistantPrincipalName,
    customViolations, setCustomViolations,
    currentTheme, setCurrentTheme,
    loadSettings,
    loadCustomViolations,
    isPhotoModalOpen, setIsPhotoModalOpen,
    modalPhotoSrc, setModalPhotoSrc,
    isConfirmModalOpen, setIsConfirmModalOpen,
    confirmMessage, setConfirmMessage,
    confirmActionRef,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};