import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectDir = path.join(uploadDir, req.params.projectId || 'default');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    cb(null, projectDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|heic|heif|webp|tiff/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// In-memory project store (would use a database in production)
const projects = new Map();

// ============ API Routes ============

// Create a new project
app.post('/api/projects', (req, res) => {
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const project = {
    id,
    name: req.body.name || 'Untitled Project',
    createdAt: new Date().toISOString(),
    status: 'created',
    photos: [],
    model: null,
    stats: {},
  };
  projects.set(id, project);
  res.json(project);
});

// List all projects
app.get('/api/projects', (req, res) => {
  res.json(Array.from(projects.values()));
});

// Get a single project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Upload photos to a project
app.post('/api/projects/:projectId/photos', upload.array('photos', 100), (req, res) => {
  const project = projects.get(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const uploaded = req.files.map(f => ({
    id: `photo_${Math.random().toString(36).slice(2, 8)}`,
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
    url: `/uploads/${req.params.projectId}/${f.filename}`,
    uploadedAt: new Date().toISOString(),
  }));

  project.photos.push(...uploaded);
  project.status = 'photos_uploaded';

  res.json({
    uploaded: uploaded.length,
    total: project.photos.length,
    photos: uploaded,
  });
});

// Start 3D processing pipeline (simulation)
app.post('/api/projects/:projectId/process', (req, res) => {
  const project = projects.get(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.photos.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 photos to process' });
  }

  project.status = 'processing';

  // Simulate processing pipeline
  const steps = [
    'feature_extraction',
    'feature_matching',
    'sfm_reconstruction',
    'dense_reconstruction',
    'mesh_generation',
    'texture_mapping',
    'optimization',
    'export',
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      project.status = 'completed';
      project.model = {
        format: 'glb',
        url: `/api/projects/${project.id}/model`,
        vertices: Math.floor(Math.random() * 50000) + 30000,
        faces: Math.floor(Math.random() * 100000) + 50000,
        textureResolution: '4096x4096',
      };
      project.stats = {
        area: (Math.random() * 100 + 50).toFixed(1) + ' m²',
        ceilingHeight: '3.5 m',
        rooms: Math.floor(Math.random() * 3) + 2,
        processedPhotos: project.photos.length,
        processingTime: ((steps.length * 3) + 'min'),
      };
      return;
    }
    project.processingStep = steps[currentStep];
    project.processingProgress = Math.round(((currentStep + 1) / steps.length) * 100);
    currentStep++;
  }, 3000);

  res.json({
    message: 'Processing started',
    totalSteps: steps.length,
    estimatedTime: `${steps.length * 3} seconds (demo)`,
  });
});

// Get processing status
app.get('/api/projects/:projectId/status', (req, res) => {
  const project = projects.get(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  res.json({
    status: project.status,
    step: project.processingStep || null,
    progress: project.processingProgress || 0,
    model: project.model || null,
    stats: project.stats || {},
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    pipeline: {
      colmap: 'simulated',
      openmvs: 'simulated',
      detectron2: 'simulated',
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n  SpaceView 3D API Server`);
  console.log(`  Running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
