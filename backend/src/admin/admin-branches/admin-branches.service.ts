import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import type { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

@Injectable()
export class AdminBranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /** Includes inactive rows, unlike the public catalog. */
  listAll() {
    return this.prisma.branch.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  /** Creates a branch. Slugs are unique. */
  async create(dto: CreateBranchDto) {
    const slug = slugify(dto.slug);

    const existing = await this.prisma.branch.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Branch slug already exists.');
    }

    const count = await this.prisma.branch.count();

    return this.prisma.branch.create({
      data: {
        slug,
        label: dto.label.trim(),
        address: dto.address.trim(),
        hours: dto.hours.trim(),
        imageUrl: dto.imageUrl ?? null,
        imagePublicId: dto.imagePublicId ?? null,
        lat: dto.lat,
        lng: dto.lng,
        active: dto.active,
        sortOrder: count + 1,
      },
    });
  }

  /** Updates a branch, replacing the Cloudinary asset when the image changes. */
  async update(id: string, dto: UpdateBranchDto): Promise<void> {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const data: Prisma.BranchUpdateInput = {};
    if (dto.label !== undefined) data.label = dto.label.trim();
    if (dto.address !== undefined) data.address = dto.address.trim();
    if (dto.hours !== undefined) data.hours = dto.hours.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl || null;
    if (dto.imagePublicId !== undefined) data.imagePublicId = dto.imagePublicId || null;
    if (dto.lat !== undefined) data.lat = dto.lat;
    if (dto.lng !== undefined) data.lng = dto.lng;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    await this.prisma.branch.update({ where: { id }, data });

    // Only after the write commits — never orphan a live reference.
    if (dto.imagePublicId !== undefined) {
      await this.cloudinary.destroyReplaced(branch.imagePublicId, dto.imagePublicId || null);
    }
  }
}
