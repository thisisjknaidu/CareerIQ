import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".docx"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Only PDF and DOCX resume files are allowed."));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
