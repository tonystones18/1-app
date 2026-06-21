import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
class MediaService {
  constructor(private readonly prisma: PrismaService) {}
  listAssets(tenantId: string) {
    return this.prisma.mediaAsset.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }
}

@ApiTags('media')
@ApiBearerAuth()
@Controller('v1/media')
class MediaController {
  constructor(private readonly service: MediaService) {}
  @Get('assets')
  @ApiOperation({ summary: 'List media assets' })
  listAssets(@CurrentUser() user: AuthUser) { return this.service.listAssets(user.tenantId); }
}

@Module({ controllers: [MediaController], providers: [MediaService] })
export class MediaModule {}
