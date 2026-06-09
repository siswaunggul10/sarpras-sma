import { useState, useEffect, FormEvent } from "react";
import { Plus, Search, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { Building } from "../types";
import { DAPODIK_BUILDING_TYPES, DAPODIK_CONDITIONS, DAPODIK_OWNERSHIP } from "../constants";
import { motion } from "motion/react";

export default function BuildingList() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState<Partial<Building>>({
    name: "",
    type: DAPODIK_BUILDING_TYPES[0],
    area: 0,
    floors: 1,
    year_built: new Date().getFullYear(),
    ownership: DAPODIK_OWNERSHIP[0],
    condition: DAPODIK_CONDITIONS[0],
    has_imb: 0,
    is_usable: 1
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    const res = await fetch("/api/buildings");
    const data = await res.json();
    setBuildings(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = editingBuilding ? "PUT" : "POST";
    const url = editingBuilding ? `/api/buildings/${editingBuilding.id}` : "/api/buildings";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setEditingBuilding(null);
    setFormData({
      name: "",
      type: DAPODIK_BUILDING_TYPES[0],
      area: 0,
      floors: 1,
      year_built: new Date().getFullYear(),
      ownership: DAPODIK_OWNERSHIP[0],
      condition: DAPODIK_CONDITIONS[0],
      has_imb: 0,
      is_usable: 1
    });
    fetchBuildings();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus bangunan ini? Semua ruang di dalamnya juga akan terhapus.")) {
      await fetch(`/api/buildings/${id}`, { method: "DELETE" });
      fetchBuildings();
    }
  };

  const openEditModal = (building: Building) => {
    setEditingBuilding(building);
    setFormData(building);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Bangunan</h2>
          <p className="text-white/60 mt-1">Kelola data gedung dan bangunan sekolah.</p>
        </div>
        <button 
          onClick={() => {
            setEditingBuilding(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Bangunan</span>
        </button>
      </div>

      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Cari bangunan..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Nama Bangunan</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Jenis</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Luas (m²)</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kepemilikan</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kondisi</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">IMB</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {buildings.map((building) => (
                <tr key={building.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium">{building.name}</div>
                    <div className="text-[10px] text-white/40">Tahun: {building.year_built} • {building.floors} Lantai</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{building.type}</td>
                  <td className="px-6 py-4 text-sm text-white/60 font-mono">{building.area}</td>
                  <td className="px-6 py-4 text-sm text-white/60">{building.ownership}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      building.condition === "Baik" ? "bg-emerald-500/10 text-emerald-500" :
                      building.condition === "Rusak Ringan" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {building.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {building.has_imb ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(building)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(building.id!)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/60 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1b1e] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-bold">{editingBuilding ? "Edit Bangunan" : "Tambah Bangunan"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nama Bangunan</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jenis Bangunan</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Luas Tapak (m²)</label>
                  <input 
                    type="number" 
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jumlah Lantai</label>
                  <input 
                    type="number" 
                    value={formData.floors}
                    onChange={e => setFormData({...formData, floors: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tahun Dibangun</label>
                  <input 
                    type="number" 
                    value={formData.year_built}
                    onChange={e => setFormData({...formData, year_built: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Kepemilikan</label>
                  <select 
                    value={formData.ownership}
                    onChange={e => setFormData({...formData, ownership: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_OWNERSHIP.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Kondisi</label>
                  <select 
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_CONDITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={!!formData.has_imb}
                      onChange={e => setFormData({...formData, has_imb: e.target.checked ? 1 : 0})}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Memiliki IMB</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={!!formData.is_usable}
                      onChange={e => setFormData({...formData, is_usable: e.target.checked ? 1 : 0})}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Layak Pakai</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
