import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  tenantId: string;
  tenantType: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string): Promise<{ tokens: TokenPair; user: Record<string, unknown> }> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    let passwordValid = false;
    if (user.passwordHash) {
      const isBcryptHash = user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$');
      if (isBcryptHash) {
        passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
      } else {
        // Development seed accounts use plain text — only allowed in non-production
        passwordValid = process.env.NODE_ENV !== 'production' && user.passwordHash === dto.password;
      }
    }

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const sessionId = crypto.randomUUID();
    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      tenantId: user.tenantId,
      tenantType: 'platform',
      sessionId,
    });

    this.logger.log(`User ${user.email} logged in from ${ipAddress ?? 'unknown'}`);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roleId: user.roleId,
        tenantId: user.tenantId,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET', this.config.get<string>('JWT_SECRET', 'change-me'));
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, { secret });
      return this.issueTokens({
        sub: payload.sub,
        email: payload.email,
        roleId: payload.roleId,
        tenantId: payload.tenantId,
        tenantType: payload.tenantType,
        sessionId: payload.sessionId,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roleId: user.roleId,
      tenantId: user.tenantId,
      status: user.status,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const secret = this.config.get<string>('JWT_SECRET', 'change-me-in-production');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET', secret);
    const accessTtl = this.config.get<number>('JWT_ACCESS_TTL', 900); // 15 min
    const refreshTtl = this.config.get<number>('JWT_REFRESH_TTL', 604800); // 7 days

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret, expiresIn: accessTtl }),
      this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: refreshTtl }),
    ]);

    return { accessToken, refreshToken, expiresIn: accessTtl, tokenType: 'Bearer' };
  }
}
