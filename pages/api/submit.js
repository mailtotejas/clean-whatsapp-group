import nextConnect from "next-connect";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

// Multer setup for file upload with size limits
const upload = multer({
  dest: "/tmp",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
      return;
    }
    cb(null, true);
  }
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("API Error:", error);
    res.status(501).json({ error: `Sorry, something went wrong! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    // Initialize Google APIs
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"]
    );
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // Prepare file metadata
    const fileMeta = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // Upload file to Drive
    const driveRes = await drive.files.create({
      resource: fileMeta,
      media: media,
      fields: "id, webViewLink",
    });

    // Now set permissions using the returned file ID
    await drive.permissions.create({
      fileId: driveRes.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    const fileLink = driveRes.data.webViewLink;

    // Save response to Google Sheets
    const row = [
      req.body.studentName,
      req.body.email,
      req.body.phone,
      req.body.altPhone,
      req.body.registered,
      req.body.referral || "",
      req.body.country,
      req.body.university,
      fileLink,
      req.body.recommend,
      new Date().toISOString(),
      req.body.feedback || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("API Error:", error);
    // Clean up temp file in case of error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("Error cleaning up temp file:", e);
      }
    }
    res.status(500).json({ error: error.message });
  }
});

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;