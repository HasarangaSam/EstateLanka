import multer from "multer";

// ============================================================
// MEMORY STORAGE
// ============================================================

const storage = multer.memoryStorage();

// ============================================================
// IMAGE FILE FILTER
// ============================================================

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// ============================================================
// PROPERTY IMAGE UPLOAD
// ============================================================

const propertyUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
});

// ============================================================
// AVATAR UPLOAD
// ============================================================

const avatarUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const uploadPropertyImages = propertyUpload.array("images", 8);

export const uploadAvatar = avatarUpload.single("avatar");
