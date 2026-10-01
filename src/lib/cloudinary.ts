import { v2 as cloudinary } from 'cloudinary';

// Configure primary and secondary credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ampcyes9';
const primaryApiKey = process.env.CLOUDINARY_API_KEY || '712157514652346';
const primaryApiSecret = process.env.CLOUDINARY_API_SECRET || 'G0PLyIfpFq07_D3n8cEEZUQJQ7A';

const secondaryApiKey = process.env.CLOUDINARY_MEDIAFLOWS_KEY || '927684331774348';
const secondaryApiSecret = process.env.CLOUDINARY_MEDIAFLOWS_SECRET || 'Q2Xv0qQgHfDikSEO-JMyyOYshHE';

cloudinary.config({
  cloud_name: cloudName,
  api_key: primaryApiKey,
  api_secret: primaryApiSecret,
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
}

function streamBuffer(
  buffer: Buffer,
  config: { cloud_name: string; api_key: string; api_secret: string },
  options: CloudinaryUploadOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
      secure: true,
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'rpf_media',
        resource_type: options.resource_type || 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error('Cloudinary did not return a secure URL'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload a multer memory buffer directly to Cloudinary CDN.
 * Streams directly from RAM into Cloudinary — 0 MB disk space used on cPanel!
 * Automatically falls back to secondary API key if primary fails.
 */
export async function uploadStreamToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  try {
    const url = await streamBuffer(
      buffer,
      { cloud_name: cloudName, api_key: primaryApiKey, api_secret: primaryApiSecret },
      options
    );
    console.log(`[Cloudinary] Successfully uploaded via Primary Key -> ${url}`);
    return url;
  } catch (primaryErr) {
    console.warn('[Cloudinary] Primary key upload failed, attempting fallback to Secondary Key:', primaryErr);
    try {
      const url = await streamBuffer(
        buffer,
        { cloud_name: cloudName, api_key: secondaryApiKey, api_secret: secondaryApiSecret },
        options
      );
      console.log(`[Cloudinary] Successfully uploaded via Secondary Key -> ${url}`);
      return url;
    } catch (secondaryErr) {
      console.error('[Cloudinary] Both Cloudinary keys failed:', secondaryErr);
      throw secondaryErr;
    }
  }
}
