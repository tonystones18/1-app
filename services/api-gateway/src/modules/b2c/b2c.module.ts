import { Module } from '@nestjs/common';
import { B2cController } from './b2c.controller';
import { B2cService } from './b2c.service';

@Module({ controllers: [B2cController], providers: [B2cService], exports: [B2cService] })
export class B2cModule {}
