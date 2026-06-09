import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Building2, 
  DoorOpen, 
  Package, 
  Settings, 
  ChevronRight,
  School,
  ClipboardList,
  Camera
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "buildings", label: "Bangunan", icon: Building2 },
    { id: "rooms", label: "Ruang", icon: DoorOpen },
    { id: "facilities", label: "Sarana", icon: Package },
    { id: "maintenance", label: "Pemeliharaan", icon: ClipboardList },
    { id: "documentation", label: "Dokumentasi", icon: Camera },
    { id: "school", label: "Sekolah", icon: School },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#151619] text-white flex flex-col border-r border-white/10">
      <div className="p-6 border-bottom border-white/5">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="text-emerald-500" />
          <span>SarpraSMA</span>
        </h1>
        <p className="text-[11px] font-semibold text-emerald-500 mt-1">
          SMAN Unggul Pidie Jaya
        </p>
        <p className="text-[9px] uppercase tracking-widest text-white/40">
          Dapodik Integrated
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {activeTab === item.id && (
              <motion.div layoutId="active-pill">
                <ChevronRight size={14} />
              </motion.div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-xs font-medium">Admin Sekolah</p>
            <p className="text-[10px] text-white/40">Operator Dapodik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
