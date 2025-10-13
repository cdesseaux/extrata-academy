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
    
    console.log('🔍 KeycloakStrategy.validate - Auth header:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não fornecido ou formato inválido');
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token recebido, length:', token.length);
    
    try {
      // Decodifica o token para obter o header
      const decoded = jwt.decode(token, { complete: true });
      console.log('🔍 Token decodificado:', !!decoded);
      console.log('🔍 Header kid:', decoded?.header?.kid);
      
      if (!decoded || !decoded.header.kid) {
        console.log('❌ Token inválido - sem header ou kid');
        throw new UnauthorizedException('Token inválido');
      }

      // Obtém a chave pública do Keycloak
      console.log('🔍 Obtendo chave pública para kid:', decoded.header.kid);
      const key = await this.getSigningKey(decoded.header.kid);
      console.log('🔍 Chave pública obtida:', !!key);
      
      // Verifica o token
      console.log('🔍 Verificando token com issuer:', `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`);
      console.log('🔍 Verificando token com audience:', process.env.KEYCLOAK_CLIENT_ID);

      // Primeiro, tenta com audience específica
      let payload: any;
      try {
        payload = jwt.verify(token, key, {
          algorithms: ['RS256'],
          issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
          // Aceita múltiplos audiences (backend e frontend)
          audience: [
            process.env.KEYCLOAK_CLIENT_ID || 'academy-backend',
            'academy-frontend',
            'account', // Keycloak adiciona esse audience automaticamente
          ],
        }) as any;
      } catch (error: any) {
        // Se falhar por causa de audience, tenta sem validar audience
        if (error.message.includes('audience') || error.message.includes('aud')) {
          console.log('⚠️ Token sem audience válida, verificando sem audience...');
          payload = jwt.verify(token, key, {
            algorithms: ['RS256'],
            issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
            // Ignora validação de audience
          }) as any;
        } else {
          throw error;
        }
      }

      console.log('Token Keycloak validado para usuário:', payload.preferred_username);

      // Cria ou atualiza o usuário no banco
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
        console.log('Criando novo usuário do Keycloak:', userData.username);
        user = await this.usersService.create(userData);
      } else {
        // Atualiza dados do usuário se necessário
        console.log('Atualizando usuário existente:', userData.username);
        user = await this.usersService.update(user.id, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles,
        });
      }

      return user;
    } catch (error: any) {
      console.error('❌ Erro na validação do token Keycloak:', error.message);
      console.error('❌ Erro completo:', error);
      console.error('❌ Token preview:', token.substring(0, 100) + '...');
      console.error('❌ Issuer esperado:', `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`);
      console.error('❌ Audience esperado:', process.env.KEYCLOAK_CLIENT_ID);
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
