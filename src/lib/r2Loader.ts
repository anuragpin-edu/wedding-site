export default function r2Loader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
  
  // If the src is already a full URL, just return it
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Ensure trailing slash on URL and no leading slash on src to avoid double slashes
  const baseUrl = url.endsWith('/') ? url : `${url}/`;
  const imagePath = src.startsWith('/') ? src.slice(1) : src;

  // With a public R2 bucket, Cloudflare automatically caches it at the edge.
  // Note: we're not currently utilizing Cloudflare image resizing params (e.g. format=auto)
  // because that requires enabling Cloudflare Image Resizing (a paid feature). 
  // If enabled in the future, we can append `?width=${width}&quality=${quality || 75}`
  
  return `${baseUrl}${imagePath}`;
}
