import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function listHomeMedia() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "wedding-media";
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

  const media = {
    images: [] as string[],
    videos: [] as string[],
    error: null as string | null,
    debug: {
      hasAccountId: !!accountId,
      hasAccessKey: !!accessKeyId,
      hasSecret: !!secretAccessKey,
      bucketName,
      publicUrl,
      NODE_ENV: process.env.NODE_ENV
    }
  };

  if (!accountId || !accessKeyId || !secretAccessKey) {
    media.error = "R2 credentials not set at runtime.";
    return media;
  }

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "home/",
    });

    const response = await s3Client.send(command);

    if (response.Contents) {
      response.Contents.forEach((item) => {
        if (!item.Key) return;
        // Skip directory objects
        if (item.Key.endsWith('/')) return;
        
        const ext = item.Key.split('.').pop()?.toLowerCase();
        
        // Construct the public URL
        const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
        const url = `${baseUrl}/${item.Key}`;

        if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp" || ext === "gif") {
          media.images.push(url);
        } else if (ext === "mp4" || ext === "mov" || ext === "webm") {
          media.videos.push(url);
        }
      });
    }
  } catch (error: any) {
    console.error("Error fetching media from R2:", error);
    media.error = error.message || String(error);
  }

  return media;
}
