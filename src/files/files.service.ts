import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    const url = await this.storage.getPresignedUrl(file.key);
    return { ...file, url };
  }

  async remove(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.storage.delete(file.key);
    return this.prisma.file.delete({ where: { id } });
  }
}
