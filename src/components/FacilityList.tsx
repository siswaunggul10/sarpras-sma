import { useState, useEffect, FormEvent } from "react";
import { Plus, Search, Trash2, Edit2, X } from "lucide-react";
import { Facility, Room } from "../types";
import { 
  DAPODIK_FACILITY_TYPES, 
  DAPODIK_CONDITIONS, 
  DAPODIK_FACILITY_STATUS, 
  DAPODIK_FUNDING_SOURCES 
} from "../constants";
import { motion } from "motion/react";

export default function FacilityList() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({
    room_id: 0,
    type: DAPODIK_FACILITY_TYPES[0],
    quantity: 1,
    unit: "Buah",
    condition: DAPODIK_CONDITIONS[0],
    status: DAPODIK_FACILITY_STATUS[0],
    year_acquired: new Date().getFullYear(),
    funding_source: DAPODIK_FUNDING_SOURCES[0]
  });

  useEffect(() => {
    fetchFacilities();
    fetchRooms();
  }, []);

  const fetchFacilities = async () => {
    const res = await fetch("/api/facilities");
    const data = await res.json();
    setFacilities(data);
  };

  const fetchRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
    if (data.length > 0 && formData.room_id === 0) {
      setFormData(prev => ({ ...prev, room_id: data[0].id }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.room_id === 0) {
      alert("Pilih ruang terlebih dahulu");
      return;
    }

    const method = editingFacility ? "PUT" : "POST";
    const url = editingFacility ? `/api/facilities/${editingFacility.id}` : "/api/facilities";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setEditingFacility(null);
    setFormData({
      room_id: rooms[0]?.id || 0,
      type: DAPODIK_FACILITY_TYPES[0],
      quantity: 1,
      unit: "Buah",
      condition: DAPODIK_CONDITIONS[0],
      status: DAPODIK_FACILITY_STATUS[0],
      year_acquired: new Date().getFullYear(),
      funding_source: DAPODIK_FUNDING_SOURCES[0]
    });
    fetchFacilities();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus sarana ini?")) {
      await fetch(`/api/facilities/${id}`, { method: "DELETE" });
      fetchFacilities();
    }
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData(facility);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Sarana</h2>
          <p className="text-white/60 mt-1">Kelola inventaris sarana di setiap ruangan sekolah.</p>
        </div>
        <button 
          onClick={() => {
            setEditingFacility(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Sarana</span>
        </button>
      </div>

      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Cari sarana..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Jenis Sarana</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Lokasi (Ruang)</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Perolehan</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kondisi</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {facilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium">{facility.type}</div>
                    <div className="text-[10px] text-white/40">ID: SAR-{facility.id?.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/60">{facility.room_name}</div>
                    <div className="text-[10px] text-white/40">{facility.building_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60 font-mono">{facility.quantity} {facility.unit}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/60">{facility.year_acquired}</div>
                    <div className="text-[10px] text-white/40">{facility.funding_source}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      facility.condition === "Baik" ? "bg-emerald-500/10 text-emerald-500" :
                      facility.condition === "Rusak Ringan" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {facility.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{facility.status}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(facility)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(facility.id!)}
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
              <h3 className="text-xl font-bold">{editingFacility ? "Edit Sarana" : "Tambah Sarana"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Lokasi (Ruang)</label>
                  <select 
                    required
                    value={formData.room_id}
                    onChange={e => setFormData({...formData, room_id: Number(e.target.value)})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value={0}>Pilih Ruang</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.building_name})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jenis Sarana</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jumlah</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Satuan</label>
                  <input 
                    type="text" 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tahun Perolehan</label>
                  <input 
                    type="number" 
                    value={formData.year_acquired}
                    onChange={e => setFormData({...formData, year_acquired: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Sumber Dana</label>
                  <select 
                    value={formData.funding_source}
                    onChange={e => setFormData({...formData, funding_source: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_FUNDING_SOURCES.map(t => <option key={t} value={t}>{t}</option>)}
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
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_FACILITY_STATUS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
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
