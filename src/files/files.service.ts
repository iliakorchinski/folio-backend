import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(file: Express.Multer.File) {
    const key = await this.storage.upload(file);
    return this.prisma.file.create({
      data: { name: file.originalname, size: file.size, key },
    });
  }

  async findAll() {
    return this.prisma.file.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
