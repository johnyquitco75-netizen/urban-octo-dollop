"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RecordFormFieldsProps {
  recordType: string;
  setRecordType: (type: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  gradeLevel: string;
  setGradeLevel: (grade: string) => void;
  recordDate: string;
  setRecordDate: (date: string) => void;
  recordTime: string;
  setRecordTime: (time: string) => void;
  details: string;
  setDetails: (details: string) => void;
}

const RecordFormFields: React.FC<RecordFormFieldsProps> = ({
  recordType,
  setRecordType,
  fullName,
  setFullName,
  gradeLevel,
  setGradeLevel,
  recordDate,
  setRecordDate,
  recordTime,
  setRecordTime,
  details,
  setDetails,
}) => {
  return (
    <>
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
    </>
  );
};

export default RecordFormFields;