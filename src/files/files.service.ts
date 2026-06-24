import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(file: Express.Multer.File, userId: string) {
    const key = await this.storage.upload(file);
    return this.prisma.file.create({
      data: { name: file.originalname, size: file.size, key, userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    if (file.userId && file.userId !== userId) throw new ForbiddenException();
    const url = await this.storage.getPresignedUrl(file.key);
    return { ...file, url };
  }

  async remove(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    if (file.userId && file.userId !== userId) throw new ForbiddenException();
    await this.storage.delete(file.key);
    return this.prisma.file.delete({ where: { id } });
  }
}
