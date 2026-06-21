import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { AggregatorModule } from './modules/aggregator/aggregator.module';
import { B2cModule } from './modules/b2c/b2c.module';
import { B2bModule } from './modules/b2b/b2b.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MediaModule } from './modules/media/media.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    // Config — loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: config.get<number>('THROTTLE_SHORT_LIMIT', 20),
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: config.get<number>('THROTTLE_MEDIUM_LIMIT', 100),
        },
        {
          name: 'long',
          ttl: 60000,
          limit: config.get<number>('THROTTLE_LONG_LIMIT', 500),
        },
      ],
    }),

    // Infrastructure
    PrismaModule,

    // Domain modules
    HealthModule,
    MetricsModule,
    AuthModule,
    AggregatorModule,
    B2cModule,
    B2bModule,
    FinanceModule,
    AnalyticsModule,
    MediaModule,
  ],
})
export class AppModule {}
