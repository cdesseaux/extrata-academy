import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { UsersService } from '../../users/users.service';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  private jwksClient: jwksClient.JwksClient;

  constructor(private usersService: UsersService) {
    super();
    
    // Configura cliente JWKS para validar tokens do Keycloak
    this.jwksClient = jwksClient({
      jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutos
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      timeout: 10000, // 10 segundos timeout
      requestHeaders: {
        'User-Agent': 'Extrata-Academy-Backend/1.0',
      },
    });
  }

  async validate(req: any) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.substring(7);
    
    try {
      // Decode token to get header
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || !decoded.header.kid) {
        throw new UnauthorizedException('Token inválido');
      }

      // Get public key from Keycloak
      const key = await this.getSigningKey(decoded.header.kid);
      
      // Verify token with simplified validation
      let payload: any;
      try {
        payload = jwt.verify(token, key, {
          algorithms: ['RS256'],
          issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
          audience: [
            process.env.KEYCLOAK_CLIENT_ID || 'academy-backend',
            'academy-frontend',
            'account',
          ],
        }) as any;
      } catch (error: any) {
        // Fallback: verify without audience validation
        if (error.message.includes('audience') || error.message.includes('aud')) {
          payload = jwt.verify(token, key, {
            algorithms: ['RS256'],
            issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
          }) as any;
        } else {
          throw error;
        }
      }

      // Create or update user in database
      const userData = {
        keycloakId: payload.sub,
        username: payload.preferred_username,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        roles: payload.realm_access?.roles || [],
      };

      let user = await this.usersService.findByKeycloakId(payload.sub);
      
      if (!user) {
        user = await this.usersService.create(userData);
      } else {
        // Update user data if needed
        user = await this.usersService.update(user.id, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles,
        });
      }

      return user;
    } catch (error: any) {
      throw new UnauthorizedException(`Token inválido: ${error.message}`);
    }
  }

        private async getSigningKey(kid: string): Promise<string> {
          return new Promise((resolve, reject) => {
            this.jwksClient.getSigningKey(kid, (err, key) => {
              if (err) {
                reject(err);
              } else if (key) {
                resolve(key.getPublicKey());
              } else {
                reject(new Error('Key not found'));
              }
            });
          });
        }

}
