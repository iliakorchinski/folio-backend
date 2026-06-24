import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly secretKey: string;

  constructor(configService: ConfigService) {
    this.secretKey = configService.getOrThrow<string>('CLERK_SECRET_KEY');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing auth token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, { secretKey: this.secretKey });
      request.userId = payload.sub;
      return true;
    } catch (err) {
      this.logger.error('Token verification failed', err);
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
