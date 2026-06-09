import { useState, useEffect, useRef } from "react";
import { Camera, Plus, Trash2, X, Image as ImageIcon, Upload } from "lucide-react";
import { Photo } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PhotoGalleryProps {
  objectType: "Bangunan" | "Ruang" | "Sarana";
  objectId: number;
}

export default function PhotoGallery({ objectType, objectId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [objectType, objectId]);

  const fetchPhotos = async () => {
    const res = await fetch(`/api/photos?object_type=${objectType}&object_id=${objectId}`);
    const data = await res.json();
    setPhotos(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("object_type", objectType);
    formData.append("object_id", objectId.toString());
    formData.append("caption", caption);

    try {
      await fetch("/api/photos", {
        method: "POST",
        body: formData
      });
      setCaption("");
      fetchPhotos();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus foto ini?")) {
      await fetch(`/api/photos/${id}`, { method: "DELETE" });
      fetchPhotos();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Camera size={16} className="text-emerald-500" />
          Dokumentasi Foto
        </h4>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Keterangan foto..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-white/20">
          <ImageIcon size={32} className="mb-2" />
          <p className="text-xs">Belum ada foto dokumentasi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden group border border-white/10"
              >
                <img 
                  src={photo.file_path} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-[10px] text-white font-medium line-clamp-2 mb-2">{photo.caption || "Tanpa keterangan"}</p>
                  <button 
                    onClick={() => handleDelete(photo.id!)}
                    className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors self-end"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
