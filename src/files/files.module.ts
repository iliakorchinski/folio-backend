import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@Module({
  controllers: [FilesController],
  providers: [FilesService, ClerkAuthGuard],
})
export class FilesModule {}
