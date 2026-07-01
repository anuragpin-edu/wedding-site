import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { unstable_cache } from "next/cache";

const getS3Client = () => {
  const accountId = (process.env.CLOUDFLARE_R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "").trim();
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const getBucketName = () => (process.env.CLOUDFLARE_R2_BUCKET_NAME || "wedding-media").trim();

const fetchMediaKeys = unstable_cache(
  async () => {
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    const keys = { images: [] as string[], videos: [] as string[], error: null as string | null, debug: {} };
    
    if (!s3Client) {
      keys.error = "R2 credentials not set at runtime.";
      return keys;
    }

    try {
      const command = new ListObjectsV2Command({ Bucket: bucketName, Prefix: "home/" });
      const response = await s3Client.send(command);

      if (response.Contents) {
        const allItems = response.Contents.filter(item => item.Key && !item.Key.endsWith('/')).map(item => item.Key!);
        
        const imageKeysList = allItems.filter(k => k.match(/\.(jpg|jpeg|png|webp)$/i));
        const videoKeysList = allItems.filter(k => k.match(/\.(mp4|webm)$/i));
        const webpKeys = new Set(imageKeysList.filter(k => k.endsWith('.webp')));
        
        imageKeysList.forEach(key => {
          if (key.endsWith('.webp')) {
            keys.images.push(key);
          } else {
            const basename = key.substring(0, key.lastIndexOf('.'));
            if (!webpKeys.has(`${basename}.webp`)) {
              keys.images.push(key);
            }
          }
        });

        keys.videos = videoKeysList;
      }
    } catch (error: any) {
      console.error("Error fetching media from R2:", error);
      keys.error = error.message || String(error);
    }
    return keys;
  },
  ['home-media-keys'],
  { revalidate: 3600 } // Cache keys for 1 hour
);

export async function listHomeMedia() {
  const keys = await fetchMediaKeys();
  const media = {
    images: [] as string[],
    videos: [] as string[],
    error: keys.error,
    debug: keys.debug,
  };

  const s3Client = getS3Client();
  const bucketName = getBucketName();

  if (!s3Client || keys.error) {
    return media;
  }

  try {
    // Generate signed URLs valid for 15 minutes (900 seconds) dynamically on every request
    const signUrl = async (key: string) => {
      const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
      return await getSignedUrl(s3Client, command, { expiresIn: 900 });
    };

    media.images = await Promise.all(keys.images.map(signUrl));
    media.videos = await Promise.all(keys.videos.map(signUrl));
  } catch (error: any) {
    console.error("Error generating signed URLs:", error);
    media.error = "Failed to secure media URLs.";
  }

  return media;
}
