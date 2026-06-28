import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { unstable_cache } from "next/cache";

export const listHomeMedia = unstable_cache(
  async () => {
    const accountId = (process.env.CLOUDFLARE_R2_ACCOUNT_ID || "").trim();
    const accessKeyId = (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "").trim();
    const secretAccessKey = (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "").trim();
    const bucketName = (process.env.CLOUDFLARE_R2_BUCKET_NAME || "wedding-media").trim();
    const publicUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").trim();

    const media = {
      images: [] as string[],
      videos: [] as string[],
      error: null as string | null,
      debug: {
        accountId: accountId,
        accessKeyId: accessKeyId,
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
      forcePathStyle: true,
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
        // Collect all items first
        const allItems = response.Contents
          .filter(item => item.Key && !item.Key.endsWith('/'))
          .map(item => item.Key!);
        
        // Find webp images and video files
        const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
        
        // If a file has a .webp version, use only the .webp. Otherwise use original.
        const imageKeys = allItems.filter(k => k.match(/\.(jpg|jpeg|png|webp)$/i));
        const videoKeys = allItems.filter(k => k.match(/\.(mp4|webm)$/i));
        
        const webpKeys = new Set(imageKeys.filter(k => k.endsWith('.webp')));
        
        imageKeys.forEach(key => {
          const url = `${baseUrl}/${key}`;
          if (key.endsWith('.webp')) {
            media.images.push(url);
          } else {
            // For jpg/png, only add if there's no webp equivalent (same basename)
            const basename = key.substring(0, key.lastIndexOf('.'));
            if (!webpKeys.has(`${basename}.webp`)) {
              media.images.push(url);
            }
          }
        });

        videoKeys.forEach(key => {
          media.videos.push(`${baseUrl}/${key}`);
        });
      }
    } catch (error: any) {
      console.error("Error fetching media from R2:", error);
      media.error = error.message || String(error);
    }

    return media;
  },
  ['home-media-list'],
  { revalidate: 3600 } // Cache for 1 hour
);
