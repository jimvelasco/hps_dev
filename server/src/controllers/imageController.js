import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const uploadImageToS3 = async (req, res) => {
  try {
    const file = req.files?.image?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const hoaId = req.fields?.hoaId?.[0] || req.body.hoaId;

    if (!hoaId) {
      return res.status(400).json({ message: "HOA ID is required" });
    }

    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
      return res.status(500).json({ message: "AWS configuration is missing" });
    }

    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    //const fileName = `${Date.now()}-${file.originalname}`;
    const fileName = `${hoaId}-${file.originalname}`;
    const fileKey = `${hoaId}/${fileName}`;
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const imageUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      key: fileKey,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message || "Error uploading image" });
  }
};

const createFolder = async (req, res) => {
  try {
    const { folderName } = req.body;

    if (!folderName || folderName.trim() === "") {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
      return res.status(500).json({ message: "AWS configuration is missing" });
    }

    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    const upperCaseFolderName = folderName.trim().toUpperCase();
    const folderKey = `${upperCaseFolderName}/`;

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: folderKey,
      Body: "",
    };

    await s3Client.send(new PutObjectCommand(params));

    res.json({
      message: "Folder created successfully",
      folderName: upperCaseFolderName,
      folderKey: folderKey,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: error.message || "Error creating folder" });
  }
};

const uploadPdfToS3 = async (req, res) => {
  try {
    const file = req.files?.pdf?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const hoaId = req.fields?.hoaId?.[0] || req.body.hoaId;
    const filePrefix = req.fields?.filePrefix?.[0] || req.body.filePrefix;

    if (!hoaId) {
      return res.status(400).json({ message: "HOA ID is required" });
    }

    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
      return res.status(500).json({ message: "AWS configuration is missing" });
    }

    

    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    let fileName = `${hoaId}-${file.originalname}`;
    if (filePrefix && filePrefix.trim()) {
       const upperCasePrefixName = filePrefix.trim().toUpperCase();
      fileName = `${hoaId}-${upperCasePrefixName.trim()}-${file.originalname}`;
    }
    const fileKey = `${hoaId}/${fileName}`;
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const pdfUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({
      message: "PDF uploaded successfully",
      pdfUrl: pdfUrl,
      key: fileKey,
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ message: error.message || "Error uploading PDF" });
  }
};

export { uploadImageToS3, createFolder, uploadPdfToS3 };
