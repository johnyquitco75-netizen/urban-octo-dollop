"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppContext } from "@/context/AppContext";

const DashboardSection = () => {
  const { db, schoolName, schoolAddress, logoData, currentUserRole, setIsLoggedIn, setCurrentUserRole, showAlert, setModalPhotoSrc, setIsPhotoModalOpen, setConfirmMessage, confirmActionRef, setIsConfirmModalOpen, setCurrentSection, setRecordToEditId } = useAppContext();

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

  // Define a color palette for the bar chart
  const BAR_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1', '#22c55e', '#f97316'];

  const getFirstAndLastName = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      first: parts[0] || '',
      last: parts.length > 1 ? parts[parts.length - 1] : ''
    };
  };

  const updateViolationBarChart = (records: any[]) => {
    const violationCounts: { [key: string]: number } = {};
    records.forEach(record => {
      violationCounts[record.violationType] = (violationCounts[record.violationType] || 0) + 1;
    });
    const chartData = Object.entries(violationCounts).map(([name, count], index) => ({
      name,
      count,
      percentage: records.length > 0 ? Math.round((count / records.length) * 100) : 0,
      fill: BAR_COLORS[index % BAR_COLORS.length] // Assign color to 'fill' property
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
  }, [db, updateRecentRecords]);

  useEffect(() => {
    updateDashboard();
  }, [currentPage, updateDashboard]);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const showPhoto = (photoData: string) => {
    setModalPhotoSrc(photoData);
    setIsPhotoModalOpen(true);
  };

  const deleteRecord = async (recordId: number) => {
    const onConfirm = async () => {
      try {
        await db.deleteRecord(recordId);
        showAlert('Record deleted!', 'success');
        updateDashboard();
      } catch (error) {
        console.error('Error deleting record:', error);
        showAlert('Failed to delete record.', 'error');
      }
    };
    setConfirmMessage('Are you sure you want to delete this record?');
    confirmActionRef.current = onConfirm;
    setIsConfirmModalOpen(true);
  };

  const handleEditRecord = (recordId: number) => {
    setRecordToEditId(recordId);
    setCurrentSection('add-record');
  };

  return (
    <section id="dashboard" className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <img
          id="dashboardLogo"
          className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
          src={logoData || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxMiIgZmlsbD0iIzRmNDZlNSIvPgo8c3ZnIHg9IjI1IiB5PSIyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KPHBhdGggZD0ibTE0IDItMyAzIDIuNSAyLjVMMTAgMTFsMyAzIDQtNCAyLjUgMi41TDIyIDl6Ii8+CjxwYXRoIGQ9Im01IDExLTMgM0wxMCAyMiAxMyAxOSA1LjUgMTEuNVoiLz4KPHBhdGggZD0ibTIgMTMgMyAzTDkgMTIgNiA5eiIvPgo8L3N2Zz4KPC9zdmc+Cjwvc3ZnPgo="}
          alt="School Logo"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{schoolName}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{schoolAddress}</p>
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
              <Bar dataKey="count" fill="fill" radius={[4, 4, 0, 0]} />
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
          <table className="w-full min-w-[850px] border-collapse"> {/* Increased min-w to accommodate new column */}
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm uppercase font-semibold tracking-wider">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Grade</th>
                <th className="py-3 px-4 text-left">Section</th> {/* New Grade Section Header */}
                <th className="py-3 px-4 text-left">Violation</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Details</th> {/* New Details column */}
                <th className="py-3 px-4 text-left">Photo</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500 dark:text-gray-400">No records found</td> {/* Updated colSpan */}
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
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{record.gradeLevel || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{record.gradeSection || 'N/A'}</td> {/* Display Grade Section */}
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{record.violationType}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{new Date(record.dateTime).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200 max-w-[150px] truncate">{record.details || 'N/A'}</td> {/* Display details, truncated */}
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
                      <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record.id)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
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
  );
};

export default DashboardSection;