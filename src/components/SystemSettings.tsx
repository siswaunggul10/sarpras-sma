import { useState, useEffect } from "react";
import { 
  Settings, 
  Database, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Info,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface SystemInfo {
  buildings: { count: number };
  rooms: { count: number };
  facilities: { count: number };
  dbSize: number;
  version: string;
}

export default function SystemSettings() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch("/api/system/info");
      const data = await res.json();
      setInfo(data);
    } catch (error) {
      console.error("Failed to fetch system info:", error);
    }
  };

  const handleReset = async () => {
    const confirmText = "HAPUS SEMUA DATA";
    const input = prompt(`PERINGATAN: Tindakan ini akan menghapus SEMUA data bangunan, ruang, dan sarana. Ketik "${confirmText}" untuk melanjutkan:`);
    
    if (input === confirmText) {
      setIsResetting(true);
      try {
        await fetch("/api/system/reset", { method: "POST" });
        alert("Semua data berhasil dihapus.");
        fetchSystemInfo();
      } catch (error) {
        alert("Gagal mereset data.");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    window.location.href = "/api/system/backup";
    setTimeout(() => setIsBackingUp(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
        <p className="text-white/60 mt-1">Kelola konfigurasi aplikasi, pemeliharaan data, dan informasi sistem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Info Card */}
        <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <Database className="text-blue-500" size={20} />
            <h3 className="font-semibold">Informasi Database</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-white/40">Ukuran Database</span>
              <span className="text-sm font-mono">{info ? formatSize(info.dbSize) : "..."}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-white/40">Versi Aplikasi</span>
              <span className="text-sm font-mono">{info?.version || "..."}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-white/40">Total Record</span>
              <span className="text-sm font-mono">
                {info ? (info.buildings.count + info.rooms.count + info.facilities.count) : "..."}
              </span>
            </div>
            <button 
              onClick={fetchSystemInfo}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/40 hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh Info</span>
            </button>
          </div>
        </div>

        {/* Security / Access Card */}
        <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" size={20} />
            <h3 className="font-semibold">Keamanan & Akses</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Mode Akses</p>
              <p className="text-sm mt-1">Administrator (Full Access)</p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Saat ini Anda masuk sebagai Admin Sekolah. Anda memiliki wewenang penuh untuk menambah, mengubah, dan menghapus data sarana prasarana.
            </p>
            <div className="pt-2">
              <button className="text-xs text-emerald-500 hover:underline">Ganti Kata Sandi (Coming Soon)</button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Actions */}
      <div className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <Settings className="text-orange-500" size={20} />
          <h3 className="font-semibold">Pemeliharaan Data</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Download size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Backup Database</h4>
                <p className="text-xs text-white/40">Unduh salinan lengkap database SQLite (.db).</p>
              </div>
            </div>
            <button 
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-xl text-sm font-bold transition-all"
            >
              {isBackingUp ? "Menyiapkan..." : "Unduh Backup (.db)"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-500">Reset Data</h4>
                <p className="text-xs text-white/40">Hapus semua data aset (Bangunan, Ruang, Sarana).</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              disabled={isResetting}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-sm font-bold transition-all"
            >
              {isResetting ? "Memproses..." : "Reset Semua Data"}
            </button>
          </div>
        </div>
      </div>

      {/* System Logs / Info */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-white/5 rounded-lg text-white/40">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white/60">Tentang SarpraSMA</h4>
          <p className="text-xs text-white/40 mt-1 leading-relaxed">
            Aplikasi ini dikembangkan untuk standarisasi pendataan sarana prasarana sekolah menengah atas. Seluruh struktur data mengikuti pedoman teknis Dapodik Kemdikbudristek. Pastikan untuk melakukan backup data secara berkala.
          </p>
        </div>
      </div>
    </div>
  );
}
