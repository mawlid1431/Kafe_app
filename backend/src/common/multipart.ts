import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

export type UploadedFilePart = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalName: string;
};

export type ParsedMultipart = {
  fields: Record<string, string>;
  files: Record<string, UploadedFilePart>;
};

/**
 * Multipart parsing without multer.
 *
 * Multer parses the request as a Node stream via busboy, which does not work
 * under the Bun runtime — the request aborts with no response and no error.
 * Instead `express.raw()` buffers the body (capped well below the 5 MB image
 * limit) and the platform's own `Request.formData()` decodes it. That API is
 * native in Bun and provided by undici in Node, so this path works on both.
 */
export async function parseMultipart(request: Request): Promise<ParsedMultipart> {
  const contentType = request.headers['content-type'];
  if (!contentType?.includes('multipart/form-data')) {
    throw new BadRequestException('Expected a multipart/form-data upload.');
  }

  const body = request.body as Buffer | undefined;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    throw new BadRequestException('No file was uploaded.');
  }

  let form: FormData;
  try {
    form = await new Request('http://localhost/upload', {
      method: 'POST',
      headers: { 'content-type': contentType },
      // Copy into a standalone ArrayBuffer — Buffer views may share a pool.
      body: new Uint8Array(body),
    }).formData();
  } catch {
    throw new BadRequestException('The upload could not be read.');
  }

  const fields: Record<string, string> = {};
  const files: Record<string, UploadedFilePart> = {};

  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') {
      fields[key] = value;
      continue;
    }

    const file = value as File;
    files[key] = {
      buffer: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type,
      size: file.size,
      originalName: file.name,
    };
  }

  return { fields, files };
}
