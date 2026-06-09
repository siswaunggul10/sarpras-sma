import { useState, useEffect } from "react";
import { Camera, Search, Filter, Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { Photo } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export default function Documentation() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const res = await fetch("/api/photos");
    const data = await res.json();
    setPhotos(data);
  };

  const filteredPhotos = photos.filter(p => {
    const matchesFilter = filter === "All" || p.object_type === filter;
    const matchesSearch = p.caption?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dokumentasi Foto</h2>
          <p className="text-white/60 mt-1">Galeri foto aset dan pemeliharaan sarana prasarana.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Cari keterangan foto..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a1b1e] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <div className="flex bg-[#1a1b1e] border border-white/5 rounded-xl p-1">
          {["All", "Bangunan", "Ruang", "Sarana"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                filter === t ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
              )}
            >
              {t === "All" ? "Semua" : t}
            </button>
          ))}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
          <ImageIcon size={64} className="mb-4" />
          <p className="text-lg font-medium">Tidak ada foto ditemukan</p>
          <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1a1b1e] border border-white/5 rounded-2xl overflow-hidden group shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={photo.file_path} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-500 border border-emerald-500/20">
                      {photo.object_type}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{photo.caption || "Tanpa keterangan"}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Calendar size={12} />
                      {photo.created_at ? format(new Date(photo.created_at), "dd MMM yyyy") : "..."}
                    </div>
                    <div className="text-[10px] text-white/20 font-mono">ID: {photo.object_id}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
