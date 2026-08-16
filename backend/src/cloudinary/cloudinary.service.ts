import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { Env } from '../config/env';
import type { UploadedFilePart } from '../common/multipart';

export const IMAGE_FOLDERS = ['menu', 'promos', 'branches'] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type UploadedImage = {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * The image file itself lives in Cloudinary. PostgreSQL stores only the secure
 * URL plus the public id needed to clean the asset up later. No binaries or
 * base64 ever touch the database.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly rootFolder: string;

  constructor(config: ConfigService<Env, true>) {
    this.rootFolder = config.get('CLOUDINARY_FOLDER', { infer: true });
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      api_key: config.get('CLOUDINARY_API_KEY', { infer: true }),
      api_secret: config.get('CLOUDINARY_API_SECRET', { infer: true }),
      secure: true,
    });
  }

  async upload(file: UploadedFilePart, folder: ImageFolder): Promise<UploadedImage> {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed.');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller.');
    }
    if (!IMAGE_FOLDERS.includes(folder)) {
      throw new BadRequestException(`folder must be one of: ${IMAGE_FOLDERS.join(', ')}`);
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${this.rootFolder}/${folder}`,
          resource_type: 'image',
          overwrite: false,
        },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error('Cloudinary upload returned no result.'));
            return;
          }
          resolve(uploaded);
        },
      );
      stream.end(file.buffer);
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  /**
   * Best-effort asset cleanup. Deliberately never throws: a Cloudinary hiccup
   * must not roll back a database write that already succeeded. A leaked asset
   * is a cost problem; a failed order edit is a correctness problem.
   */
  async destroy(publicId: string | null | undefined): Promise<void> {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      this.logger.log(`Destroyed Cloudinary asset ${publicId}`);
    } catch (error) {
      this.logger.warn(`Failed to destroy Cloudinary asset ${publicId}: ${(error as Error).message}`);
    }
  }

  /**
   * Destroys the previous asset when an entity's image is replaced.
   * No-op when the id is unchanged or there was no previous asset.
   */
  async destroyReplaced(
    previousPublicId: string | null | undefined,
    nextPublicId: string | null | undefined,
  ): Promise<void> {
    if (!previousPublicId || previousPublicId === nextPublicId) return;
    await this.destroy(previousPublicId);
  }
}
