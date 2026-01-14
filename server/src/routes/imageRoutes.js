import express from "express";
import multer from "multer";
import { uploadImageToS3, createFolder, uploadPdfToS3 } from "../controllers/imageController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "hoaId", maxCount: 1 }
]), uploadImageToS3);

router.post("/upload-pdf", pdfUpload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "hoaId", maxCount: 1 },
  { name: "selectedFileType", maxCount: 1 }
]), uploadPdfToS3);

router.post("/create-folder", createFolder);

export default router;

/* zen coder recommends
router.post("/upload", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "hoaId", maxCount: 1 }
]), uploadImageToS3);

router.post("/upload-pdf", pdfUpload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "hoaId", maxCount: 1 },
  { name: "selectedFileType", maxCount: 1 }
]), uploadPdfToS3);

*/
