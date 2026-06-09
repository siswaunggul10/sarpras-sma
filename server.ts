import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import multer from "multer";

const db = new Database("sarpra.db");

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS school_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    npsn TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    address TEXT,
    academic_year TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    area REAL,
    floors INTEGER,
    year_built INTEGER,
    ownership TEXT,
    condition TEXT,
    has_imb INTEGER DEFAULT 0,
    is_usable INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    area REAL,
    capacity INTEGER,
    condition TEXT,
    has_electricity INTEGER DEFAULT 0,
    has_internet INTEGER DEFAULT 0,
    is_usable INTEGER DEFAULT 1,
    description TEXT,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    condition TEXT,
    status TEXT,
    year_acquired INTEGER,
    funding_source TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_type TEXT NOT NULL,
    object_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    condition_before TEXT,
    condition_after TEXT,
    action TEXT,
    cost REAL,
    officer TEXT
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_type TEXT NOT NULL,
    object_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial school info if empty
const schoolCount = db.prepare("SELECT COUNT(*) as count FROM school_info").get() as { count: number };
if (schoolCount.count === 0) {
  db.prepare("INSERT INTO school_info (npsn, name, status, address, academic_year) VALUES (?, ?, ?, ?, ?)").run(
    "12345678", "SMA Negeri 1 Contoh", "Negeri", "Jl. Pendidikan No. 1", "2023/2024"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // School Info
  app.get("/api/school", (req, res) => {
    const school = db.prepare("SELECT * FROM school_info LIMIT 1").get();
    res.json(school);
  });

  app.put("/api/school", (req, res) => {
    const { npsn, name, status, address, academic_year } = req.body;
    db.prepare("UPDATE school_info SET npsn = ?, name = ?, status = ?, address = ?, academic_year = ? WHERE id = 1")
      .run(npsn, name, status, address, academic_year);
    res.json({ success: true });
  });

  // Buildings
  app.get("/api/buildings", (req, res) => {
    const buildings = db.prepare("SELECT * FROM buildings").all();
    res.json(buildings);
  });

  app.post("/api/buildings", (req, res) => {
    const { name, type, area, floors, year_built, ownership, condition, has_imb, is_usable } = req.body;
    const result = db.prepare(`
      INSERT INTO buildings (name, type, area, floors, year_built, ownership, condition, has_imb, is_usable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, type, area, floors, year_built, ownership, condition, has_imb ? 1 : 0, is_usable ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/buildings/:id", (req, res) => {
    const { id } = req.params;
    const { name, type, area, floors, year_built, ownership, condition, has_imb, is_usable } = req.body;
    db.prepare(`
      UPDATE buildings SET name = ?, type = ?, area = ?, floors = ?, year_built = ?, ownership = ?, condition = ?, has_imb = ?, is_usable = ?
      WHERE id = ?
    `).run(name, type, area, floors, year_built, ownership, condition, has_imb ? 1 : 0, is_usable ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/buildings/:id", (req, res) => {
    db.prepare("DELETE FROM buildings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Rooms
  app.get("/api/rooms", (req, res) => {
    const rooms = db.prepare(`
      SELECT r.*, b.name as building_name 
      FROM rooms r 
      JOIN buildings b ON r.building_id = b.id
    `).all();
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { building_id, name, type, area, capacity, condition, has_electricity, has_internet, is_usable, description } = req.body;
    const result = db.prepare(`
      INSERT INTO rooms (building_id, name, type, area, capacity, condition, has_electricity, has_internet, is_usable, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(building_id, name, type, area, capacity, condition, has_electricity ? 1 : 0, has_internet ? 1 : 0, is_usable ? 1 : 0, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const { building_id, name, type, area, capacity, condition, has_electricity, has_internet, is_usable, description } = req.body;
    db.prepare(`
      UPDATE rooms SET building_id = ?, name = ?, type = ?, area = ?, capacity = ?, condition = ?, has_electricity = ?, has_internet = ?, is_usable = ?, description = ?
      WHERE id = ?
    `).run(building_id, name, type, area, capacity, condition, has_electricity ? 1 : 0, has_internet ? 1 : 0, is_usable ? 1 : 0, description, id);
    res.json({ success: true });
  });

  app.delete("/api/rooms/:id", (req, res) => {
    db.prepare("DELETE FROM rooms WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Facilities
  app.get("/api/facilities", (req, res) => {
    const facilities = db.prepare(`
      SELECT f.*, r.name as room_name, b.name as building_name
      FROM facilities f
      JOIN rooms r ON f.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
    `).all();
    res.json(facilities);
  });

  app.post("/api/facilities", (req, res) => {
    const { room_id, type, quantity, unit, condition, status, year_acquired, funding_source } = req.body;
    const result = db.prepare(`
      INSERT INTO facilities (room_id, type, quantity, unit, condition, status, year_acquired, funding_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(room_id, type, quantity, unit, condition, status, year_acquired, funding_source);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/facilities/:id", (req, res) => {
    const { id } = req.params;
    const { room_id, type, quantity, unit, condition, status, year_acquired, funding_source } = req.body;
    db.prepare(`
      UPDATE facilities SET room_id = ?, type = ?, quantity = ?, unit = ?, condition = ?, status = ?, year_acquired = ?, funding_source = ?
      WHERE id = ?
    `).run(room_id, type, quantity, unit, condition, status, year_acquired, funding_source, id);
    res.json({ success: true });
  });

  app.delete("/api/facilities/:id", (req, res) => {
    db.prepare("DELETE FROM facilities WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const buildings = db.prepare("SELECT COUNT(*) as count FROM buildings").get() as { count: number };
    const rooms = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as { count: number };
    const facilities = db.prepare("SELECT SUM(quantity) as count FROM facilities").get() as { count: number };
    const damaged = db.prepare("SELECT COUNT(*) as count FROM facilities WHERE condition IN ('Rusak Sedang', 'Rusak Berat')").get() as { count: number };
    
    res.json({
      buildings: buildings.count,
      rooms: rooms.count,
      facilities: facilities.count || 0,
      damaged: damaged.count
    });
  });

  // Export CSV
  app.get("/api/export/:type", (req, res) => {
    const { type } = req.params;
    let data: any[] = [];
    let filename = `export_${type}.csv`;

    if (type === "buildings") {
      data = db.prepare("SELECT * FROM buildings").all();
    } else if (type === "rooms") {
      data = db.prepare("SELECT r.*, b.name as building_name FROM rooms r JOIN buildings b ON r.building_id = b.id").all();
    } else if (type === "facilities") {
      data = db.prepare("SELECT f.*, r.name as room_name FROM facilities f JOIN rooms r ON f.room_id = r.id").all();
    }

    if (data.length === 0) {
      return res.status(404).send("No data to export");
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? "")).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csv);
  });

  // System Settings
  app.get("/api/system/info", (req, res) => {
    const stats = {
      buildings: db.prepare("SELECT COUNT(*) as count FROM buildings").get() as any,
      rooms: db.prepare("SELECT COUNT(*) as count FROM rooms").get() as any,
      facilities: db.prepare("SELECT COUNT(*) as count FROM facilities").get() as any,
      dbSize: fs.statSync("sarpra.db").size,
      version: "1.0.0-stable"
    };
    res.json(stats);
  });

  app.post("/api/system/reset", (req, res) => {
    db.transaction(() => {
      db.prepare("DELETE FROM facilities").run();
      db.prepare("DELETE FROM rooms").run();
      db.prepare("DELETE FROM buildings").run();
      db.prepare("DELETE FROM maintenance").run();
    })();
    res.json({ success: true });
  });

  app.get("/api/system/backup", (req, res) => {
    const backupPath = path.join(__dirname, "sarpra.db");
    res.download(backupPath, "sarpra_backup.db");
  });

  // Maintenance API
  app.get("/api/maintenance", (req, res) => {
    const maintenance = db.prepare(`
      SELECT m.*, 
        CASE 
          WHEN m.object_type = 'Bangunan' THEN (SELECT name FROM buildings WHERE id = m.object_id)
          WHEN m.object_type = 'Ruang' THEN (SELECT name FROM rooms WHERE id = m.object_id)
          WHEN m.object_type = 'Sarana' THEN (SELECT type FROM facilities WHERE id = m.object_id)
        END as object_name
      FROM maintenance m
      ORDER BY m.date DESC
    `).all();
    res.json(maintenance);
  });

  app.post("/api/maintenance", (req, res) => {
    const { object_type, object_id, date, condition_before, condition_after, action, cost, officer } = req.body;
    const result = db.prepare(`
      INSERT INTO maintenance (object_type, object_id, date, condition_before, condition_after, action, cost, officer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(object_type, object_id, date, condition_before, condition_after, action, cost, officer);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/maintenance/:id", (req, res) => {
    db.prepare("DELETE FROM maintenance WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Photos API
  app.get("/api/photos", (req, res) => {
    const { object_type, object_id } = req.query;
    let query = "SELECT * FROM photos";
    const params: any[] = [];

    if (object_type && object_id) {
      query += " WHERE object_type = ? AND object_id = ?";
      params.push(object_type, object_id);
    }
    
    query += " ORDER BY created_at DESC";
    const photos = db.prepare(query).all(...params);
    res.json(photos);
  });

  app.post("/api/photos", upload.single("photo"), (req, res) => {
    const { object_type, object_id, caption } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const result = db.prepare(`
      INSERT INTO photos (object_type, object_id, file_path, caption)
      VALUES (?, ?, ?, ?)
    `).run(object_type, object_id, filePath, caption);

    res.json({ id: result.lastInsertRowid, file_path: filePath });
  });

  app.delete("/api/photos/:id", (req, res) => {
    const photo = db.prepare("SELECT file_path FROM photos WHERE id = ?").get() as { file_path: string };
    if (photo) {
      const fullPath = path.join(process.cwd(), "public", photo.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      db.prepare("DELETE FROM photos WHERE id = ?").run(req.params.id);
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
