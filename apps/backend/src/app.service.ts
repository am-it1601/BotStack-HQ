import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '@botstackhq/shared-types';

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString(),
    };
  }
}
