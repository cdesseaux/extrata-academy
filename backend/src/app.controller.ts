import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('System')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      sentry: {
        enabled: process.env.SENTRY_ENABLED === 'true',
        configured: !!process.env.SENTRY_DSN,
      },
      keycloak: {
        url: process.env.KEYCLOAK_URL,
        realm: process.env.KEYCLOAK_REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID,
      }
    };
  }

  @Get('test-sentry')
  @ApiOperation({
    summary: 'Test Sentry error tracking',
    description: 'Throws an intentional error to test Sentry integration. Only works if SENTRY_ENABLED=true'
  })
  testSentry() {
    throw new Error('🧪 Test error for Sentry - This is intentional!');
  }
}
