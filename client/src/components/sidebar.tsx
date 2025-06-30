import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "pairs", label: "Pair Management", icon: "fas fa-link" },
    { id: "sessions", label: "Session Control", icon: "fas fa-user-shield" },
    { id: "blocklist", label: "Blocklist Manager", icon: "fas fa-ban" },
    { id: "monitoring", label: "Live Monitoring", icon: "fas fa-chart-line" },
    { id: "webhooks", label: "Discord Webhooks", icon: "fab fa-discord" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center">
            <i className="fas fa-forward text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AutoForwardX</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
