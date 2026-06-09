import { motion } from "motion/react";
import { 
  Building2, 
  DoorOpen, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Stats } from "../types";

interface DashboardProps {
  stats: Stats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const cards = [
    { label: "Total Bangunan", value: stats.buildings, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Ruang", value: stats.rooms, icon: DoorOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Sarana", value: stats.facilities, icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Sarana Rusak", value: stats.damaged, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const chartData = [
    { name: "Bangunan", value: stats.buildings },
    { name: "Ruang", value: stats.rooms },
    { name: "Sarana", value: stats.facilities },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-white/60 mt-1">Ringkasan data sarana dan prasarana sekolah.</p>
        </div>
        <button 
          onClick={() => window.open('/api/export/facilities', '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
        >
          <Download size={16} />
          <span>Export Laporan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#1a1b1e] border border-white/5 rounded-2xl relative overflow-hidden group"
          >
            <div className={cn("p-3 rounded-xl inline-block mb-4", card.bg)}>
              <card.icon className={card.color} size={24} />
            </div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{card.label}</p>
            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={20} className="text-white/20" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-[#1a1b1e] border border-white/5 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Distribusi Aset</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-[#1a1b1e] border border-white/5 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Kondisi Sarana</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Baik', value: stats.facilities - stats.damaged },
                    { name: 'Rusak', value: stats.damaged },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-white/60">Baik</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-white/60">Rusak</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
