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
  schoolAddress: string; // Added schoolAddress
  setSchoolAddress: (address: string) => void; // Added setter for schoolAddress
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
  isAppInitialized: boolean;
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
  const [schoolAddress, setSchoolAddress] = useState("Rizal Street, Brgy. III, Poblacion, Pontevedra, Negros Occidental"); // Initial state for school address
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

  const [isAppInitialized, setIsAppInitialized] = useState(false);

  const showAlert = useCallback((message: string, type: "success" | "error" | "info") => {
    if (type === "success") showSuccess(message);
    else if (type === "error") showError(message);
    else showLoading(message);
    setTimeout(() => dismissToast(), 5000);
  }, []);

  const loadSettings = useCallback(async () => {
    const savedSchoolName = await db.getSetting('schoolName') || 'Sample Elementary School';
    const savedSchoolAddress = await db.getSetting('schoolAddress') || 'Rizal Street, Brgy. III, Poblacion, Pontevedra, Negros Occidental'; // Load school address
    const savedCustomPhrase = await db.getSetting('customPhrase') || 'add custom phrase here:';
    const savedLogoData = await db.getSetting('logoData');
    const savedGuidanceOfficer = await db.getSetting('guidanceOfficer') || '';
    const savedCpcOfficer = await db.getSetting('cpcGuidanceOfficerName') || '';
    const savedPrincipal = await db.getSetting('principalName') || '';
    const savedAssistantPrincipal = await db.getSetting('assistantPrincipalName') || '';
    const savedTheme = await db.getSetting('theme') || 'default';

    setSchoolName(savedSchoolName);
    setSchoolAddress(savedSchoolAddress); // Set school address
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
        setIsAppInitialized(true); // Set to true on successful initialization
        showAlert('App loaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('Failed to initialize app. Please refresh the page.', 'error');
        setIsAppInitialized(false); // Ensure it's false on failure
      }
    };
    initApp();
  }, [showAlert, loadSettings, loadCustomViolations]);

  // --- Theming ---
  useEffect(() => {
    const root = document.documentElement;
    const themes: { [key: string]: { [key: string]: string } } = {
      default: {
        // Base colors from globals.css :root
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--primary': '245 65% 50%', // Representative indigo/purple for default theme
        '--primary-foreground': '210 40% 98%', // White
        '--secondary': '190 80% 95%', // Light Cyan Blue
        '--secondary-foreground': '190 80% 20%', // Dark Cyan Blue
        '--muted': '210 40% 96.1%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '222.2 84% 4.9%',
        '--radius': '0.5rem',
        // Sidebar colors for default
        '--sidebar-background': '0 0% 98%',
        '--sidebar-foreground': '240 5.3% 26.1%',
        '--sidebar-primary': '240 5.9% 10%',
        '--sidebar-primary-foreground': '0 0% 98%',
        '--sidebar-accent': '240 4.8% 95.9%',
        '--sidebar-accent-foreground': '240 5.9% 10%',
        '--sidebar-border': '220 13% 91%',
        '--sidebar-ring': '217.2 91.2% 59.8%',
      },
      green: {
        // Base colors (can inherit or redefine if needed)
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--muted': '210 40% 96.1%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '222.2 84% 4.9%',
        '--radius': '0.5rem',
        // Green specific colors
        '--primary': '142.1 76.2% 36.3%', // A strong green
        '--primary-foreground': '0 0% 98%', // White
        '--secondary': '190 80% 95%', // Light Cyan Blue
        '--secondary-foreground': '190 80% 20%', // Dark Cyan Blue
        '--sidebar-background': '142.1 76.2% 36.3%', // Green sidebar
        '--sidebar-foreground': '0 0% 98%', // White text
        '--sidebar-primary': '142.1 76.2% 36.3%', // Green primary for sidebar
        '--sidebar-primary-foreground': '0 0% 98%', // White
        '--sidebar-accent': '142.1 76.2% 36.3% / 0.1', // Light green accent
        '--sidebar-accent-foreground': '142.1 76.2% 36.3%', // Dark green
        '--sidebar-border': '142.1 76.2% 36.3% / 0.2',
        '--sidebar-ring': '142.1 76.2% 36.3%',
      },
      purple: {
        // Base colors (can inherit or redefine if needed)
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--muted': '210 40% 96.1%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '222.2 84% 4.9%',
        '--radius': '0.5rem',
        // Purple specific colors
        '--primary': '262.1 83.3% 57.8%', // A strong purple
        '--primary-foreground': '210 40% 98%', // White
        '--secondary': '190 80% 95%', // Light Cyan Blue
        '--secondary-foreground': '190 80% 20%', // Dark Cyan Blue
        '--sidebar-background': '262.1 83.3% 57.8%', // Purple sidebar
        '--sidebar-foreground': '210 40% 98%', // White text
        '--sidebar-primary': '262.1 83.3% 57.8%', // Purple primary for sidebar
        '--sidebar-primary-foreground': '210 40% 98%', // White
        '--sidebar-accent': '262.1 83.3% 57.8% / 0.1', // Light purple accent
        '--sidebar-accent-foreground': '262.1 83.3% 57.8%', // Dark purple
        '--sidebar-border': '262.1 83.3% 57.8% / 0.2',
        '--sidebar-ring': '262.1 83.3% 57.8%',
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
    schoolAddress, setSchoolAddress, // Added to context value
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
    isAppInitialized,
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