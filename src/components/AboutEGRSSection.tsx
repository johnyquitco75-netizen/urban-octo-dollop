"use client";

import React from "react";
import { Card } from "@/components/ui/card";

const AboutEGRSSection = () => {
  return (
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
  );
};

export default AboutEGRSSection;