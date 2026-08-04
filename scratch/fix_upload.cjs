const fs = require('fs');
let content = fs.readFileSync('src/routes/uploadRoutes.ts', 'utf8');

const multerConfig = \
import path from 'path';
import fs_node from 'fs';

// Setup multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const handleUploadErrors = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const saveFileLocally = async (file: Express.Multer.File): Promise<string> => {
  const ext = path.extname(file.originalname);
  const filename = crypto.randomUUID() + ext;
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs_node.existsSync(uploadDir)) {
    fs_node.mkdirSync(uploadDir, { recursive: true });
  }
  const filepath = path.join(uploadDir, filename);
  fs_node.writeFileSync(filepath, file.buffer);
  return '/uploads/' + filename;
};
\;

content = content.replace('const router = express.Router();', multerConfig + '\nconst router = express.Router();');
fs.writeFileSync('src/routes/uploadRoutes.ts', content);

