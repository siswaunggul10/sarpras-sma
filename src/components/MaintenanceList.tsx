import { useState, useEffect, FormEvent } from "react";
import { Plus, Search, Trash2, Calendar, User, Wrench, DollarSign, X, ClipboardList } from "lucide-react";
import { Maintenance, Building, Room, Facility } from "../types";
import { DAPODIK_CONDITIONS } from "../constants";
import { motion } from "motion/react";
import { format } from "date-fns";

export default function MaintenanceList() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Maintenance>>({
    object_type: "Sarana",
    object_id: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    condition_before: DAPODIK_CONDITIONS[0],
    condition_after: DAPODIK_CONDITIONS[0],
    action: "",
    cost: 0,
    officer: ""
  });

  useEffect(() => {
    fetchRecords();
    fetchObjects();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch("/api/maintenance");
    const data = await res.json();
    setRecords(data);
  };

  const fetchObjects = async () => {
    const [bRes, rRes, fRes] = await Promise.all([
      fetch("/api/buildings"),
      fetch("/api/rooms"),
      fetch("/api/facilities")
    ]);
    const [bData, rData, fData] = await Promise.all([
      bRes.json(),
      rRes.json(),
      fRes.json()
    ]);
    setBuildings(bData);
    setRooms(rData);
    setFacilities(fData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.object_id === 0) {
      alert("Pilih objek yang dipelihara");
      return;
    }

    await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setFormData({
      object_type: "Sarana",
      object_id: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      condition_before: DAPODIK_CONDITIONS[0],
      condition_after: DAPODIK_CONDITIONS[0],
      action: "",
      cost: 0,
      officer: ""
    });
    fetchRecords();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus riwayat pemeliharaan ini?")) {
      await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      fetchRecords();
    }
  };

  const getObjectOptions = () => {
    switch (formData.object_type) {
      case "Bangunan":
        return buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>);
      case "Ruang":
        return rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.building_name})</option>);
      case "Sarana":
        return facilities.map(f => <option key={f.id} value={f.id}>{f.type} - {f.room_name}</option>);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Riwayat Pemeliharaan</h2>
          <p className="text-white/60 mt-1">Catat dan pantau aktivitas perbaikan sarana prasarana.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} />
          <span>Tambah Catatan</span>
        </button>
      </div>

      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Tanggal & Objek</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Tindakan</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kondisi (Bef/Aft)</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Biaya</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Petugas</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/20 italic">
                    Belum ada riwayat pemeliharaan.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                        <Calendar size={12} />
                        {format(new Date(record.date), "dd MMM yyyy")}
                      </div>
                      <div className="font-medium text-sm">{record.object_name}</div>
                      <div className="text-[10px] text-orange-500/60 uppercase font-bold tracking-tighter">{record.object_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/80 max-w-xs truncate">{record.action}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-white/40">{record.condition_before}</span>
                        <span className="text-white/20">→</span>
                        <span className="text-emerald-500 font-bold">{record.condition_after}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-white/60">
                      Rp {record.cost.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <User size={14} />
                        {record.officer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(record.id!)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Wrench className="text-orange-500" size={20} />
                Catat Pemeliharaan
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jenis Objek</label>
                  <select 
                    value={formData.object_type}
                    onChange={e => setFormData({...formData, object_type: e.target.value as any, object_id: 0})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="Bangunan">Bangunan</option>
                    <option value="Ruang">Ruang</option>
                    <option value="Sarana">Sarana</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Pilih Objek</label>
                  <select 
                    required
                    value={formData.object_id}
                    onChange={e => setFormData({...formData, object_id: Number(e.target.value)})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    <option value={0}>Pilih {formData.object_type}</option>
                    {getObjectOptions()}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tanggal</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Biaya (Rp)</label>
                  <input 
                    type="number" 
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Kondisi Sebelum</label>
                  <select 
                    value={formData.condition_before}
                    onChange={e => setFormData({...formData, condition_before: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {DAPODIK_CONDITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Kondisi Sesudah</label>
                  <select 
                    value={formData.condition_after}
                    onChange={e => setFormData({...formData, condition_after: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {DAPODIK_CONDITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Tindakan / Perbaikan</label>
                <textarea 
                  required
                  placeholder="Contoh: Servis rutin AC, Penggantian lampu, Pengecatan ulang..."
                  value={formData.action}
                  onChange={e => setFormData({...formData, action: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 h-20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Petugas / Teknisi</label>
                <input 
                  required
                  type="text" 
                  value={formData.officer}
                  onChange={e => setFormData({...formData, officer: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                />
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
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
