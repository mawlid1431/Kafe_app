import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ClerkGuard, OptionalClerkGuard } from '../auth/clerk/clerk.guard';
import { CurrentIdentity } from '../auth/clerk/current-identity.decorator';
import type { ClerkIdentity } from '../auth/clerk/clerk.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * Returns `null` — not 401 — when there is no session or no local row yet,
   * because the app renders its signed-out state from that.
   */
  @Get('me')
  @UseGuards(OptionalClerkGuard)
  async me(@CurrentIdentity() identity?: ClerkIdentity) {
    if (!identity) return null;
    const user = await this.users.findByClerkId(identity.clerkId);
    return user ? UsersService.toPublic(user) : null;
  }

  /** Projects the Clerk profile into our users table. */
  @Post('sync')
  @UseGuards(ClerkGuard)
  @HttpCode(HttpStatus.OK)
  sync(@CurrentIdentity() identity: ClerkIdentity, @Body() dto: SyncUserDto) {
    return this.users.syncFromAuth(identity, dto);
  }
}
