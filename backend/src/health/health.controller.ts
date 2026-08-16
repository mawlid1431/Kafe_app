import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/** Minimum backend version the mobile app requires before using live data. */
export const API_VERSION = 2;

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Replaces `health.ping`. Response shape is kept so the app's readiness gate
   * (`useBackendStatus`) ports across unchanged.
   */
  @Get()
  async ping() {
    let catalogReady = false;
    try {
      catalogReady = (await this.prisma.branch.count()) >= 0;
    } catch {
      catalogReady = false;
    }

    return {
      ok: true as const,
      service: 'kafeeman-api',
      version: API_VERSION,
      catalogReady,
    };
  }
}
