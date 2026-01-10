import express from "express";
import multer from "multer";
import { uploadImageToS3, createFolder } from "../controllers/imageController.js";

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

router.post("/upload", upload.single("image"), uploadImageToS3);
router.post("/create-folder", createFolder);

export default router;
