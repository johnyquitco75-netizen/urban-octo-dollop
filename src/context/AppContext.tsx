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
  schoolAddress: string;
  setSchoolAddress: (address: string) => void;
  customPhrase: string;
  setCustomPhrase: (phrase: string) => void;
  logoData: string | null;
  setLogoData: (data: string | null) => void;
  leftHeaderLogoData: string | null; // New state for left header logo
  setLeftHeaderLogoData: (data: string | null) => void; // Setter for left header logo
  rightHeaderLogoData: string | null; // New state for right header logo
  setRightHeaderLogoData: (data: string | null) => void; // Setter for right header logo
  guidanceOfficer: string;
  setGuidanceOfficer: (name: string) => void;
  guidanceOfficerPosition: string; // New state for Guidance Officer Position
  setGuidanceOfficerPosition: (position: string) => void; // Setter for Guidance Officer Position
  cpcGuidanceOfficerName: string;
  setCpcGuidanceOfficerName: (name: string) => void;
  cpcGuidanceOfficerPosition: string; // New state for CPC/Guidance Officer Position
  setCpcGuidanceOfficerPosition: (position: string) => void; // Setter for CPC/Guidance Officer Position
  principalName: string;
  setPrincipalName: (name: string) => void;
  principalPosition: string; // New state for Principal Position
  setPrincipalPosition: (position: string) => void; // Setter for Principal Position
  assistantPrincipalName: string;
  setAssistantPrincipalName: (name: string) => void;
  assistantPrincipalPosition: string; // New state for Assistant Principal Position
  setAssistantPrincipalPosition: (position: string) => void; // Setter for Assistant Principal Position
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
  // New editable header fields
  republicText: string;
  setRepublicText: (text: string) => void;
  departmentText: string;
  setDepartmentText: (text: string) => void;
  regionText: string;
  setRegionText: (text: string) => void;
  divisionText: string;
  setDivisionText: (text: string) => void;
  // New states for navigation and editing
  currentSection: string;
  setCurrentSection: (section: string) => void;
  recordToEditId: number | null;
  setRecordToEditId: (id: number | null) => void;
  // New font settings
  customPhraseFontSize: string;
  setCustomPhraseFontSize: (size: string) => void;
  customPhraseFontColor: string;
  setCustomPhraseFontColor: (color: string) => void;
  dateTimeFontSize: string;
  setDateTimeFontSize: (size: string) => void;
  dateTimeFontColor: string;
  setDateTimeFontColor: (color: string) => void;
  // New state for hiding all headers
  hideAllHeaders: boolean;
  setHideAllHeaders: (hide: boolean) => void;
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
  const [schoolName, setSchoolName] = useState("SAMPLE ELEMENTARY SCHOOL");
  const [schoolAddress, setSchoolAddress] = useState("Rizal Street, Brgy. III, Poblacion, Pontevedra, Negros Occidental 6105");
  const [customPhrase, setCustomPhrase] = useState("Commit thy works unto the lord, and your plan will succeed-Proverbs 16:3");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [leftHeaderLogoData, setLeftHeaderLogoData] = useState<string | null>(null); // New state
  const [rightHeaderLogoData, setRightHeaderLogoData] = useState<string | null>(null); // New state
  const [guidanceOfficer, setGuidanceOfficer] = useState("");
  const [guidanceOfficerPosition, setGuidanceOfficerPosition] = useState("Guidance Officer"); // Default position
  const [cpcGuidanceOfficerName, setCpcGuidanceOfficerName] = useState("");
  const [cpcGuidanceOfficerPosition, setCpcGuidanceOfficerPosition] = useState("CPC/Guidance Officer"); // Default position
  const [principalName, setPrincipalName] = useState("");
  const [principalPosition, setPrincipalPosition] = useState("Principal"); // Default position
  const [assistantPrincipalName, setAssistantPrincipalName] = useState("");
  const [assistantPrincipalPosition, setAssistantPrincipalPosition] = useState("Assistant Principal"); // Default position
  const [customViolations, setCustomViolations] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState("default");

  // New editable header fields
  const [republicText, setRepublicText] = useState("Republic of the Philippines");
  const [departmentText, setDepartmentText] = useState("Department of Education");
  const [regionText, setRegionText] = useState("Region VII, Central Visayas");
  const [divisionText, setDivisionText] = useState("Division of Cebu City");

  // New states for navigation and editing
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [recordToEditId, setRecordToEditId] = useState<number | null>(null);

  // New font settings
  const [customPhraseFontSize, setCustomPhraseFontSize] = useState("1rem"); // Default to 16px
  const [customPhraseFontColor, setCustomPhraseFontColor] = useState("#ffffff"); // Default to white
  const [dateTimeFontSize, setDateTimeFontSize] = useState("1rem"); // Default to 16px
  const [dateTimeFontColor, setDateTimeFontColor] = useState("#ffffff"); // Default to white

  // New state for hiding all headers
  const [hideAllHeaders, setHideAllHeaders] = useState(false);


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
    const savedSchoolName = await db.getSetting('schoolName') || 'SAMPLE ELEMENTARY SCHOOL';
    const savedSchoolAddress = await db.getSetting('schoolAddress') || 'Rizal Street, Brgy. III, Poblacion, Pontevedra, Negros Occidental 6105';
    const savedCustomPhrase = await db.getSetting('customPhrase') || 'Commit thy works unto the lord, and your plan will succeed-Proverbs 16:3';
    const savedLogoData = await db.getSetting('logoData');
    const savedLeftHeaderLogoData = await db.getSetting('leftHeaderLogoData'); // Load new setting
    const savedRightHeaderLogoData = await db.getSetting('rightHeaderLogoData'); // Load new setting
    const savedGuidanceOfficer = await db.getSetting('guidanceOfficer') || '';
    const savedGuidanceOfficerPosition = await db.getSetting('guidanceOfficerPosition') || 'Guidance Officer'; // Load new setting
    const savedCpcOfficer = await db.getSetting('cpcGuidanceOfficerName') || '';
    const savedCpcOfficerPosition = await db.getSetting('cpcGuidanceOfficerPosition') || 'CPC/Guidance Officer'; // Load new setting
    const savedPrincipal = await db.getSetting('principalName') || '';
    const savedPrincipalPosition = await db.getSetting('principalPosition') || 'Principal'; // Load new setting
    const savedAssistantPrincipal = await db.getSetting('assistantPrincipalName') || '';
    const savedAssistantPrincipalPosition = await db.getSetting('assistantPrincipalPosition') || 'Assistant Principal'; // Load new setting
    const savedTheme = await db.getSetting('theme') || 'default';
    // Load new editable header fields
    const savedRepublicText = await db.getSetting('republicText') || 'Republic of the Philippines';
    const savedDepartmentText = await db.getSetting('departmentText') || 'Department of Education';
    const savedRegionText = await db.getSetting('regionText') || 'Region VII, Central Visayas';
    const savedDivisionText = await db.getSetting('divisionText') || 'Division of Cebu City';
    // Load new font settings
    const savedCustomPhraseFontSize = await db.getSetting('customPhraseFontSize') || '1rem';
    const savedCustomPhraseFontColor = await db.getSetting('customPhraseFontColor') || '#ffffff';
    const savedDateTimeFontSize = await db.getSetting('dateTimeFontSize') || '1rem';
    const savedDateTimeFontColor = await db.getSetting('dateTimeFontColor') || '#ffffff';
    // Load new hideAllHeaders setting
    const savedHideAllHeaders = await db.getSetting('hideAllHeaders') || false;


    setSchoolName(savedSchoolName);
    setSchoolAddress(savedSchoolAddress);
    setCustomPhrase(savedCustomPhrase);
    setLogoData(savedLogoData);
    setLeftHeaderLogoData(savedLeftHeaderLogoData); // Set new state
    setRightHeaderLogoData(savedRightHeaderLogoData); // Set new state
    setGuidanceOfficer(savedGuidanceOfficer);
    setGuidanceOfficerPosition(savedGuidanceOfficerPosition); // Set new state
    setCpcGuidanceOfficerName(savedCpcOfficer);
    setCpcGuidanceOfficerPosition(savedCpcOfficerPosition); // Set new state
    setPrincipalName(savedPrincipal);
    setPrincipalPosition(savedPrincipalPosition); // Set new state
    setAssistantPrincipalName(savedAssistantPrincipal);
    setAssistantPrincipalPosition(savedAssistantPrincipalPosition); // Set new state
    setCurrentTheme(savedTheme);
    // Set new editable header fields
    setRepublicText(savedRepublicText);
    setDepartmentText(savedDepartmentText);
    setRegionText(savedRegionText);
    setDivisionText(savedDivisionText);
    // Set new font settings
    setCustomPhraseFontSize(savedCustomPhraseFontSize);
    setCustomPhraseFontColor(savedCustomPhraseFontColor);
    setDateTimeFontSize(savedDateTimeFontSize);
    setDateTimeFontColor(savedDateTimeFontColor);
    // Set new hideAllHeaders state
    setHideAllHeaders(savedHideAllHeaders);
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
        setIsAppInitialized(true);
        showAlert('App loaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('Failed to initialize app. Please refresh the page.', 'error');
        setIsAppInitialized(false);
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
        '--sidebar-ring': '217.2 91.2% 59.8%',
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
    schoolAddress, setSchoolAddress,
    customPhrase, setCustomPhrase,
    logoData, setLogoData,
    leftHeaderLogoData, setLeftHeaderLogoData, // Added to context value
    rightHeaderLogoData, setRightHeaderLogoData, // Added to context value
    guidanceOfficer, setGuidanceOfficer,
    guidanceOfficerPosition, setGuidanceOfficerPosition, // Added to context value
    cpcGuidanceOfficerName, setCpcGuidanceOfficerName,
    cpcGuidanceOfficerPosition, setCpcGuidanceOfficerPosition, // Added to context value
    principalName, setPrincipalName,
    principalPosition, setPrincipalPosition, // Added to context value
    assistantPrincipalName, setAssistantPrincipalName,
    assistantPrincipalPosition, setAssistantPrincipalPosition, // Added to context value
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
    // New editable header fields
    republicText, setRepublicText,
    departmentText, setDepartmentText,
    regionText, setRegionText,
    divisionText, setDivisionText,
    // New states for navigation and editing
    currentSection, setCurrentSection,
    recordToEditId, setRecordToEditId,
    // New font settings
    customPhraseFontSize, setCustomPhraseFontSize,
    customPhraseFontColor, setCustomPhraseFontColor,
    dateTimeFontSize, setDateTimeFontSize,
    dateTimeFontColor, setDateTimeFontColor,
    // New state for hiding all headers
    hideAllHeaders, setHideAllHeaders,
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