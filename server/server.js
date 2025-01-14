import express from "express";
import multer from "multer";
import { create } from "js-kubo-rpc-client";
import crypto from "crypto"; // Import crypto module
import cors from "cors"; // Import cors module

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS


// IPFS Client Configuration
const ipfs = create({ url: "http://localhost:5001" }); // Replace with your IPFS API endpoint

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory temporarily
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

// Endpoint to upload a file to IPFS
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }
  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

  try {
    // Add the file to IPFS
    const result = await ipfs.add({ content: req.file.buffer });
    console.log("File uploaded to IPFS:", result);
    res.json({ 
      cid: result.cid.toString(),
      fileHash,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      message: "File uploaded to IPFS!" 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file to IPFS" });
  }
});

// Endpoint to retrieve a file from IPFS
app.get("/file/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const fileContent = Buffer.concat(chunks);

    res.setHeader("Content-Disposition", `attachment; filename="${cid}"`);
    res.send(fileContent);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ error: "Failed to retrieve file from IPFS" });
  }
});

app.get("/bulk-files", async (req, res) => {
  const { cids } = req.query;

  if (!cids) {
    return res.status(400).json({ error: "No CIDs provided" });
  }

  const cidList = Array.isArray(cids) ? cids : cids.split(',');

  try {
    const files = [];

    for (const cid of cidList) {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      const fileContent = Buffer.concat(chunks);
      files.push({ cid, content: fileContent.toString('base64') });
    }

    res.json({ files });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ error: "Failed to retrieve files from IPFS" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`IPFS Upload Server is running on http://localhost:${port}`);
});
