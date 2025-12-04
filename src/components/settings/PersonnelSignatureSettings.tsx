"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

const PersonnelSignatureSettings = () => {
  const {
    guidanceOfficer, setGuidanceOfficer,
    guidanceOfficerPosition, setGuidanceOfficerPosition,
    cpcGuidanceOfficerName, setCpcGuidanceOfficerName,
    cpcGuidanceOfficerPosition, setCpcGuidanceOfficerPosition,
    principalName, setPrincipalName,
    principalPosition, setPrincipalPosition,
    assistantPrincipalName, setAssistantPrincipalName,
    assistantPrincipalPosition, setAssistantPrincipalPosition,
  } = useAppContext();

  return (
    <div className="space-y-4">
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
          <Label htmlFor="guidanceOfficerPosition" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Guidance Officer Position
          </Label>
          <Input
            id="guidanceOfficerPosition"
            type="text"
            placeholder="Officer position for reports"
            value={guidanceOfficerPosition}
            onChange={(e) => setGuidanceOfficerPosition(e.target.value)}
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
          <Label htmlFor="cpcGuidanceOfficerPosition" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            CPC/Guidance Officer Position
          </Label>
          <Input
            id="cpcGuidanceOfficerPosition"
            type="text"
            placeholder="CPC/Guidance Officer position for reports"
            value={cpcGuidanceOfficerPosition}
            onChange={(e) => setCpcGuidanceOfficerPosition(e.target.value)}
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
          <Label htmlFor="principalPosition" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Principal Position
          </Label>
          <Input
            id="principalPosition"
            type="text"
            placeholder="Principal position for reports"
            value={principalPosition}
            onChange={(e) => setPrincipalPosition(e.target.value)}
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
        <div>
          <Label htmlFor="assistantPrincipalPosition" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
            Assistant Principal Position
          </Label>
          <Input
            id="assistantPrincipalPosition"
            type="text"
            placeholder="Assistant Principal position for reports"
            value={assistantPrincipalPosition}
            onChange={(e) => setAssistantPrincipalPosition(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonnelSignatureSettings;