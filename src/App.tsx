import React, { useState } from 'react';
import "./index.css";
import {
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  Upload,
  FileText,
  Plus,
  Menu,
  X,
} from "lucide-react";

import { Dashboard } from '@/Main_Content/Dashboard';
import { StudentsTable } from '@/Main_Content/StudentsTable';
import { FileUpload } from '@/Main_Content/FileUpload';
import { Reports } from '@/Main_Content/Reports';
import { Settings } from '@/Main_Content/Settings';

type Tab =
  | "dashboard"
  | "students"
  | "upload"
  | "reports"
  | "settings";


export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard" as Tab, label: "Дашборд", icon: LayoutDashboard},
    { id: "students" as Tab, label: "Студенты", icon: Users },
    { id: "upload" as Tab, label: "Загрузка", icon: Upload },
    { id: "reports" as Tab, label: "Отчёты", icon: FileText },
    { id: "settings" as Tab, label: "Настройки", icon: SettingsIcon},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Система учета именных стипендий
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Управление показателями и достижениями студентов
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors 
                      ${ activeTab === item.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 bottom-0 w-64 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold">Меню</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "students" && <StudentsTable />}
            {/* {activeTab === "students" && (
              <StudentsTable
                onSelectStudent={setSelectedStudent}
              />
            )} */}
            {activeTab === "upload" && <FileUpload />}
            {activeTab === "reports" && <Reports />}
            {activeTab === "settings" && <Settings />}
          </div>
        </main> 
         
      </div>
    </div>
  );
}

export default App;
