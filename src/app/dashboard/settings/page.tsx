"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Cog6ToothIcon, ShieldCheckIcon, UserGroupIcon, BellIcon, CloudIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("system");
  const tabs = [
    { id: "system", label: "System", icon: Cog6ToothIcon },
    { id: "security", label: "Security", icon: ShieldCheckIcon },
    { id: "users", label: "Users", icon: UserGroupIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "integrations", label: "Integrations", icon: CloudIcon },
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case "system":
        return <div>System Settings Content</div>;
      case "security":
        return <div>Security Settings Content</div>;
      case "users":
        return <div>User Management Content</div>;
      case "notifications":
        return <div>Notification Settings Content</div>;
      case "integrations":
        return <div>Integrations Content</div>;
      default:
        return null;
    }
  };
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure application settings and preferences</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
