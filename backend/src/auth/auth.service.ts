import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(payload: any): Promise<any> {
    // Validação do usuário baseada no payload do JWT
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      username: payload.preferred_username,
      roles: payload.realm_access?.roles || [],
    };
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}


