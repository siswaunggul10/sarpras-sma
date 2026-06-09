import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BuildingList from "./components/BuildingList";
import RoomList from "./components/RoomList";
import FacilityList from "./components/FacilityList";
import MaintenanceList from "./components/MaintenanceList";
import Documentation from "./components/Documentation";
import SchoolSettings from "./components/SchoolSettings";
import SystemSettings from "./components/SystemSettings";
import { Stats } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<Stats>({
    buildings: 0,
    rooms: 0,
    facilities: 0,
    damaged: 0
  });

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard stats={stats} />;
      case "buildings":
        return <BuildingList />;
      case "rooms":
        return <RoomList />;
      case "facilities":
        return <FacilityList />;
      case "maintenance":
        return <MaintenanceList />;
      case "documentation":
        return <Documentation />;
      case "school":
        return <SchoolSettings />;
      case "settings":
        return <SystemSettings />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="flex bg-[#0f1012] text-white min-h-screen font-sans selection:bg-emerald-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-white/20 tracking-wide">
              Copyright © Zainal Abidin, S.Pd (SMAN Unggul Pidie Jaya) - 2026
            </p>
          </footer>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-64 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
