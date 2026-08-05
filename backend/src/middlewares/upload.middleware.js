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

const makeFileFilter = (allowedMimeTypes, message) => (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new ApiError(400, "INVALID_FILE_TYPE", message));
};

const imageFileFilter = makeFileFilter(
  ["image/jpeg", "image/png", "image/webp"],
  "Seules les images jpeg, png et webp sont acceptees",
);

const supplierInvoiceFileFilter = makeFileFilter(
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "Seuls les fichiers PDF, DOC et DOCX sont acceptes",
);

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024) },
});

const supplierInvoiceUpload = multer({
  storage,
  fileFilter: supplierInvoiceFileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) },
});

export const uploadSingle = (field) => upload.single(field);
export const uploadMultiple = (field, max = 10) => upload.array(field, max);
export const uploadSupplierInvoiceSingle = (field) =>
  supplierInvoiceUpload.single(field);
