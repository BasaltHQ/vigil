import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs/promises";
import * as path from "path";

export async function uploadBufferToS3(buffer: Buffer, filename: string, folder: string, contentType: string = "application/octet-stream"): Promise<{ shareUrl?: string, error?: string }> {
  const s3Provider = (process.env.STORAGE_PROVIDER || "").toLowerCase();
  
  if (s3Provider !== "s3") {
    return { error: "Data room unavailable: STORAGE_PROVIDER is not s3" };
  }

  const s3Endpoint = process.env.S3_ENDPOINT || "";
  const s3Region = process.env.S3_REGION || "us-west-or";
  const s3Bucket = process.env.S3_BUCKET_NAME || "basaltvigil";
  const s3AccessKey = process.env.S3_ACCESS_KEY;
  const s3SecretKey = process.env.S3_SECRET_KEY;

  if (!s3AccessKey || !s3SecretKey || !s3Endpoint) {
    return { error: "S3 credentials incomplete" };
  }

  const s3Client = new S3Client({
    endpoint: s3Endpoint,
    region: s3Region,
    credentials: {
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
    },
    forcePathStyle: true,
  });

  try {
    const objectKey = `data-room/${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    const endpointUrl = s3Endpoint.endsWith("/") ? s3Endpoint.slice(0, -1) : s3Endpoint;
    
    // OVH requires virtual-hosted style URLs for public unauthenticated access
    let shareUrl = `${endpointUrl}/${s3Bucket}/${objectKey}`;
    if (endpointUrl.includes('ovh.us')) {
      const host = endpointUrl.replace('https://', '').replace('http://', '');
      shareUrl = `https://${s3Bucket}.${host}/${objectKey}`;
    }

    return { shareUrl };
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return { error: error.message };
  }
}

export async function dataRoomUpload(filePath: string, folder: string): Promise<{ shareUrl?: string, error?: string }> {
  const s3Provider = (process.env.STORAGE_PROVIDER || "").toLowerCase();
  
  if (s3Provider !== "s3") {
    return { error: "Data room unavailable: STORAGE_PROVIDER is not s3" };
  }

  const s3Endpoint = process.env.S3_ENDPOINT || "";
  const s3Region = process.env.S3_REGION || "us-west-or";
  const s3Bucket = process.env.S3_BUCKET_NAME || "basaltvigil";
  const s3AccessKey = process.env.S3_ACCESS_KEY;
  const s3SecretKey = process.env.S3_SECRET_KEY;

  if (!s3AccessKey || !s3SecretKey || !s3Endpoint) {
    return { error: "S3 credentials incomplete" };
  }

  const s3Client = new S3Client({
    endpoint: s3Endpoint,
    region: s3Region,
    credentials: {
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
    },
    // Required for some S3-compatible providers (like OVH/Cloudflare)
    forcePathStyle: true,
  });

  try {
    const fileBuffer = await fs.readFile(filePath);
    const objectKey = `data-room/${folder}/${path.basename(filePath)}`;

    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: objectKey,
      Body: fileBuffer,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    const endpointUrl = s3Endpoint.endsWith("/") ? s3Endpoint.slice(0, -1) : s3Endpoint;
    const shareUrl = `${endpointUrl}/${s3Bucket}/${objectKey}`;

    return { shareUrl };
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return { error: error.message };
  }
}
