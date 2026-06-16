import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { ApiError } from "../utils/response.util.js";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new ApiError(400, "INVALID_FILE_TYPE", "Seules les images jpeg, png et webp sont acceptees"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024) },
});

export const uploadSingle = (field) => upload.single(field);
export const uploadMultiple = (field, max = 10) => upload.array(field, max);

