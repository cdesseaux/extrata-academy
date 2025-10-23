import { Controller, Get, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CustomThrottle } from '../common/decorators/custom-throttle.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @CustomThrottle('auth-profile', { limit: 30, ttl: 60000 }) // 30 requests per minute
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @CustomThrottle('auth-verify', { limit: 20, ttl: 60000 }) // 20 requests per minute
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Get('debug')
  @CustomThrottle('auth-debug', { limit: 5, ttl: 900000 }) // 5 requests per 15 minutes
  @ApiOperation({ summary: 'Debug token information' })
  @ApiResponse({ status: 200, description: 'Token debug info' })
  debugToken(@Headers('authorization') authHeader: string) {
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      return { error: 'No authorization header' };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return { error: 'Invalid authorization format' };
    }

    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 50) + '...');

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token, { complete: true });
      
      return {
        tokenReceived: true,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 50) + '...',
        decoded: decoded ? {
          header: decoded.header,
          payload: {
            sub: decoded.payload?.sub,
            preferred_username: decoded.payload?.preferred_username,
            email: decoded.payload?.email,
            iss: decoded.payload?.iss,
            aud: decoded.payload?.aud,
            exp: decoded.payload?.exp,
            iat: decoded.payload?.iat,
          }
        } : null
      };
    } catch (error) {
      return {
        error: 'Failed to decode token',
        message: error.message
      };
    }
  }

  @Get('env-debug')
  @CustomThrottle('auth-env-debug', { limit: 5, ttl: 900000 }) // 5 requests per 15 minutes
  @ApiOperation({ summary: 'Debug environment variables' })
  @ApiResponse({ status: 200, description: 'Environment variables info' })
  debugEnv() {
    return {
      KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'Não definida',
      KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'Não definida',
      KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'Não definida',
      KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET ? 'Definida' : 'Não definida',
      DB_HOST: process.env.DB_HOST || 'Não definida',
      DB_NAME: process.env.DB_NAME || 'Não definida',
      NODE_ENV: process.env.NODE_ENV || 'Não definida',
    };
  }

  @Get('test-token')
  @CustomThrottle('auth-test-token', { limit: 5, ttl: 900000 }) // 5 requests per 15 minutes
  @ApiOperation({ summary: 'Test token validation' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  testToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No authorization header' };
    }

    const token = authHeader.substring(7);
    
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded) {
        return { error: 'Failed to decode token' };
      }

      const expectedIssuer = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;
      const expectedAudience = process.env.KEYCLOAK_CLIENT_ID;

      return {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 50) + '...',
        decoded: {
          header: decoded.header,
          payload: {
            sub: decoded.payload?.sub,
            preferred_username: decoded.payload?.preferred_username,
            email: decoded.payload?.email,
            iss: decoded.payload?.iss,
            aud: decoded.payload?.aud,
            exp: decoded.payload?.exp,
            iat: decoded.payload?.iat,
            realm_access: decoded.payload?.realm_access,
          }
        },
        validation: {
          expectedIssuer,
          actualIssuer: decoded.payload?.iss,
          issuerMatch: decoded.payload?.iss === expectedIssuer,
          expectedAudience,
          actualAudience: decoded.payload?.aud,
          audienceMatch: decoded.payload?.aud === expectedAudience,
          isExpired: decoded.payload?.exp ? Date.now() / 1000 > decoded.payload.exp : false,
        }
      };
    } catch (error: any) {
      return {
        error: 'Failed to decode token',
        message: error.message
      };
    }
  }
}
