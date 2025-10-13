import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check básico' })
  @ApiResponse({ status: 200, description: 'Sistema saudável' })
  @ApiResponse({ status: 503, description: 'Sistema com problemas' })
  async check() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Health check detalhado' })
  @ApiResponse({ status: 200, description: 'Status detalhado do sistema' })
  async detailedCheck() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Sistema pronto' })
  @ApiResponse({ status: 503, description: 'Sistema não pronto' })
  async readiness() {
    return this.healthService.getReadinessStatus();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Sistema vivo' })
  async liveness() {
    return this.healthService.getLivenessStatus();
  }
}


