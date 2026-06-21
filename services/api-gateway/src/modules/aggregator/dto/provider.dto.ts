import { IsString, IsOptional, IsEnum, IsInt, IsDecimal, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum ProviderStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateProviderDto {
  @ApiProperty({ example: 'pragmatic' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Pragmatic Play' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
  @ApiPropertyOptional({ enum: ProviderStatus })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;
}

export class CreateProviderPricingDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 500, description: 'Buy price in basis points (500 = 5%)' })
  @IsInt()
  @Min(0)
  @Max(10000)
  buyBps: number;

  @ApiPropertyOptional()
  @IsOptional()
  minFee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  maxFee?: string;

  @ApiProperty({ description: 'ISO 8601 date when pricing becomes effective' })
  @IsDateString()
  effectiveAt: string;
}

export class RecordProviderHealthDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded', 'down'] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  latencyMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  errorRate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  details?: Record<string, unknown>;
}

export class ProviderListQueryDto {
  @ApiPropertyOptional({ enum: ProviderStatus })
  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: string;
}
