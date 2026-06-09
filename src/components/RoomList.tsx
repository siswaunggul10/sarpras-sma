import { useState, useEffect, FormEvent } from "react";
import { Plus, Search, Trash2, Edit2, Check, X, Zap, Globe } from "lucide-react";
import { Room, Building } from "../types";
import { DAPODIK_ROOM_TYPES, DAPODIK_CONDITIONS } from "../constants";
import { motion } from "motion/react";

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({
    building_id: 0,
    name: "",
    type: DAPODIK_ROOM_TYPES[0],
    area: 0,
    capacity: 0,
    condition: DAPODIK_CONDITIONS[0],
    has_electricity: 1,
    has_internet: 0,
    is_usable: 1,
    description: ""
  });

  useEffect(() => {
    fetchRooms();
    fetchBuildings();
  }, []);

  const fetchRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
  };

  const fetchBuildings = async () => {
    const res = await fetch("/api/buildings");
    const data = await res.json();
    setBuildings(data);
    if (data.length > 0 && formData.building_id === 0) {
      setFormData(prev => ({ ...prev, building_id: data[0].id }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.building_id === 0) {
      alert("Pilih bangunan terlebih dahulu");
      return;
    }

    const method = editingRoom ? "PUT" : "POST";
    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({
      building_id: buildings[0]?.id || 0,
      name: "",
      type: DAPODIK_ROOM_TYPES[0],
      area: 0,
      capacity: 0,
      condition: DAPODIK_CONDITIONS[0],
      has_electricity: 1,
      has_internet: 0,
      is_usable: 1,
      description: ""
    });
    fetchRooms();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus ruang ini? Semua sarana di dalamnya juga akan terhapus.")) {
      await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      fetchRooms();
    }
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData(room);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Ruang</h2>
          <p className="text-white/60 mt-1">Kelola data ruangan di setiap bangunan sekolah.</p>
        </div>
        <button 
          onClick={() => {
            setEditingRoom(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Ruang</span>
        </button>
      </div>

      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Cari ruang..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Nama Ruang</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Bangunan</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Jenis</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Luas & Kapasitas</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Fasilitas</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Kondisi</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-[10px] text-white/40">{room.description || "Tidak ada keterangan"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{room.building_name}</td>
                  <td className="px-6 py-4 text-sm text-white/60">{room.type}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/60 font-mono">{room.area} m²</div>
                    <div className="text-[10px] text-white/40">{room.capacity} Orang</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {room.has_electricity ? <Zap size={14} className="text-yellow-500" /> : <Zap size={14} className="text-white/10" />}
                      {room.has_internet ? <Globe size={14} className="text-blue-500" /> : <Globe size={14} className="text-white/10" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      room.condition === "Baik" ? "bg-emerald-500/10 text-emerald-500" :
                      room.condition === "Rusak Ringan" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {room.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(room)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id!)}
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
              <h3 className="text-xl font-bold">{editingRoom ? "Edit Ruang" : "Tambah Ruang"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Bangunan</label>
                  <select 
                    required
                    value={formData.building_id}
                    onChange={e => setFormData({...formData, building_id: Number(e.target.value)})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value={0}>Pilih Bangunan</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nama Ruang</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jenis Ruang</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    {DAPODIK_ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Luas Ruang (m²)</label>
                  <input 
                    type="number" 
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Kapasitas (Orang)</label>
                  <input 
                    type="number" 
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
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
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Keterangan</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 h-20"
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={!!formData.has_electricity}
                    onChange={e => setFormData({...formData, has_electricity: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Listrik</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={!!formData.has_internet}
                    onChange={e => setFormData({...formData, has_internet: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Internet</span>
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
