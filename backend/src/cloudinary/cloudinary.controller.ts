import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../auth/admin/admin.guard';
import { parseMultipart } from '../common/multipart';
import { CloudinaryService, IMAGE_FOLDERS, type ImageFolder } from './cloudinary.service';
import { DestroyImageDto } from './dto/destroy-image.dto';

@Controller('admin/uploads')
@UseGuards(AdminGuard)
export class CloudinaryController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  /**
   * React → NestJS → Cloudinary. Returns the secure URL and public id, which
   * the caller then submits with the entity form so Prisma can persist them.
   */
  @Post('image')
  async uploadImage(@Req() request: Request) {
    const { fields, files } = await parseMultipart(request);

    const file = files.file;
    if (!file) {
      throw new BadRequestException('No file was uploaded. Use the "file" field.');
    }

    const folder = fields.folder;
    if (!IMAGE_FOLDERS.includes(folder as ImageFolder)) {
      throw new BadRequestException(`folder must be one of: ${IMAGE_FOLDERS.join(', ')}`);
    }

    return this.cloudinary.upload(file, folder as ImageFolder);
  }

  /** Manual cleanup. Entity update/delete already destroys assets automatically. */
  @Delete('image')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroyImage(@Body() dto: DestroyImageDto): Promise<void> {
    await this.cloudinary.destroy(dto.publicId);
  }
}
