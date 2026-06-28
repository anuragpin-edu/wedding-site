import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'wedding-media';

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2 credentials in environment variables.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function run() {
  const prefix = 'home/';
  console.log(`Starting media optimization for bucket: ${bucketName}, prefix: ${prefix}`);
  
  let continuationToken: string | undefined;
  let totalBeforeBytes = 0;
  let totalAfterBytes = 0;
  let processedCount = 0;

  do {
    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));

    if (!listRes.Contents) break;

    for (const obj of listRes.Contents) {
      if (!obj.Key) continue;
      
      // Skip directories or videos
      if (obj.Key.endsWith('/')) continue;
      if (obj.Key.match(/\.(mp4|webm|mov)$/i)) {
        console.log(`Skipping video: ${obj.Key}`);
        continue;
      }

      console.log(`Processing ${obj.Key} (Size: ${obj.Size || 0} bytes)`);
      totalBeforeBytes += obj.Size || 0;

      // Download
      const getRes = await s3.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: obj.Key,
      }));

      if (!getRes.Body) {
        console.log(`Failed to get body for ${obj.Key}`);
        continue;
      }

      const bodyBytes = await getRes.Body.transformToByteArray();
      const inputBuffer = Buffer.from(bodyBytes);

      // Compress using sharp
      const outputBuffer = await sharp(inputBuffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const newSize = outputBuffer.length;
      totalAfterBytes += newSize;
      
      const parsed = path.parse(obj.Key);
      const newKey = `${parsed.dir ? parsed.dir + '/' : ''}${parsed.name}.webp`;

      console.log(`  Compressed to ${newSize} bytes. Uploading to ${newKey}...`);

      // Upload
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: newKey,
        Body: outputBuffer,
        ContentType: 'image/webp',
      }));
      
      processedCount++;
    }

    continuationToken = listRes.NextContinuationToken;
  } while (continuationToken);

  console.log('--- Optimization Complete ---');
  console.log(`Processed ${processedCount} images.`);
  console.log(`Total Before Size: ${(totalBeforeBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total After Size: ${(totalAfterBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space Saved: ${((totalBeforeBytes - totalAfterBytes) / 1024 / 1024).toFixed(2)} MB`);
}

run().catch(console.error);
