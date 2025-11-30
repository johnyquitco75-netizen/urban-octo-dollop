"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/context/AppContext';

const LoginScreen = () => {
  const { setIsLoggedIn, setCurrentUserRole, appPasswords, showAlert } = useAppContext();
  const [accessLevel, setAccessLevel] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
    } else {
      showAlert('Invalid credentials. Please try again.', 'error');
      setPassword('');
    }
  };

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
};

export default LoginScreen;