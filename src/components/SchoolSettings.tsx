import { useState, useEffect, FormEvent } from "react";
import { Save, School as SchoolIcon, MapPin, Hash, Calendar } from "lucide-react";
import { SchoolInfo } from "../types";

export default function SchoolSettings() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    const res = await fetch("/api/school");
    const data = await res.json();
    setSchool(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!school) return;

    setIsSaving(true);
    await fetch("/api/school", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(school)
    });
    setIsSaving(false);
    alert("Data sekolah berhasil diperbarui");
  };

  if (!school) return <div className="p-8 text-white/40">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Identitas Sekolah</h2>
        <p className="text-white/60 mt-1">Data induk sekolah sesuai referensi Dapodik.</p>
      </div>

      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <SchoolIcon className="text-emerald-500" size={20} />
          <h3 className="font-semibold">Profil Sekolah</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Hash size={12} /> NPSN
              </label>
              <input 
                required
                type="text" 
                value={school.npsn}
                onChange={e => setSchool({...school, npsn: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
                <SchoolIcon size={12} /> Nama Sekolah
              </label>
              <input 
                required
                type="text" 
                value={school.name}
                onChange={e => setSchool({...school, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Status Sekolah</label>
              <select 
                value={school.status}
                onChange={e => setSchool({...school, status: e.target.value})}
                className="w-full bg-[#1a1b1e] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              >
                <option value="Negeri">Negeri</option>
                <option value="Swasta">Swasta</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={12} /> Tahun Ajaran Aktif
              </label>
              <input 
                required
                type="text" 
                placeholder="Contoh: 2023/2024"
                value={school.academic_year}
                onChange={e => setSchool({...school, academic_year: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={12} /> Alamat Lengkap
            </label>
            <textarea 
              value={school.address}
              onChange={e => setSchool({...school, address: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all h-24 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Save size={18} />
              <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
          <SchoolIcon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-400">Tips Sinkronisasi</h4>
          <p className="text-xs text-white/60 mt-1 leading-relaxed">
            Pastikan NPSN dan Nama Sekolah sesuai dengan data di portal Dapodik untuk memudahkan proses sinkronisasi data sarana prasarana nantinya.
          </p>
        </div>
      </div>
    </div>
  );
}
