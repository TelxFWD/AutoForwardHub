import { useState } from "react";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import PairsTable from "@/components/pairs-table";
import SessionStatus from "@/components/session-status";
import BlocklistSummary from "@/components/blocklist-summary";
import ActivityFeed from "@/components/activity-feed";
import AddPairModal from "@/components/add-pair-modal";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, UserCircle } from "lucide-react";
import type { SystemStats } from "@shared/schema";

export default function Dashboard() {
  const [isAddPairModalOpen, setIsAddPairModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<SystemStats>({
    queryKey: ["/api/stats"],
  });

  const pauseAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/control/pause-all"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All pairs have been paused",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to pause all pairs",
        variant: "destructive",
      });
    },
  });

  const resumeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/control/resume-all"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All pairs have been resumed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resume all pairs",
        variant: "destructive",
      });
    },
  });

  const isGloballyActive = stats && stats.activePairs > 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-sm text-gray-600">Monitor and control your message forwarding operations</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Global Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Global Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isGloballyActive ? 'bg-success' : 'bg-gray-400'}`}></div>
                  <span className={`text-sm font-medium ${isGloballyActive ? 'text-success' : 'text-gray-500'}`}>
                    {isGloballyActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Global Controls */}
              {isGloballyActive ? (
                <Button 
                  onClick={() => pauseAllMutation.mutate()}
                  disabled={pauseAllMutation.isPending}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause All
                </Button>
              ) : (
                <Button 
                  onClick={() => resumeAllMutation.mutate()}
                  disabled={resumeAllMutation.isPending}
                  className="bg-secondary text-white hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume All
                </Button>
              )}
              
              <Button variant="outline" className="text-gray-700">
                <UserCircle className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics Cards */}
          <StatsCards />

          {/* Quick Actions & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsAddPairModalOpen(true)}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create New Pair
                </Button>
                <Button className="w-full bg-secondary text-white hover:bg-green-700">
                  <i className="fas fa-user-plus mr-2"></i>
                  Add Session
                </Button>
                <Button variant="outline" className="w-full">
                  <i className="fas fa-download mr-2"></i>
                  Export Config
                </Button>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Telegram Reader</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discord Bot</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Telegram Poster</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Admin Bot</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sm font-medium text-warning">Reconnecting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <i className="fas fa-exclamation-triangle text-error text-sm mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Trap detected in GBPUSD</p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <i className="fas fa-pause-circle text-warning text-sm mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">XAUUSD pair auto-paused</p>
                    <p className="text-xs text-gray-600">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <i className="fas fa-info-circle text-primary text-sm mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New session added</p>
                    <p className="text-xs text-gray-600">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Pairs Table */}
          <PairsTable onAddPair={() => setIsAddPairModalOpen(true)} />

          {/* Session Management & Blocklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SessionStatus />
            <BlocklistSummary />
          </div>

          {/* Live Activity Feed */}
          <ActivityFeed />
        </main>
      </div>

      {/* Add Pair Modal */}
      <AddPairModal 
        isOpen={isAddPairModalOpen} 
        onClose={() => setIsAddPairModalOpen(false)} 
      />
    </div>
  );
}
