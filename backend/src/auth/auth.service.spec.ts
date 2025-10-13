import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn((payload) => 'mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user from JWT payload', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        preferred_username: 'johndoe',
        realm_access: {
          roles: ['user', 'admin'],
        },
      };

      const result = await service.validateUser(payload);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        roles: ['user', 'admin'],
      });
    });

    it('should handle payload without roles', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        preferred_username: 'johndoe',
      };

      const result = await service.validateUser(payload);

      expect(result.roles).toEqual([]);
    });
  });

  describe('login', () => {
    it('should return access token and user', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        roles: ['user'],
      };

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        roles: user.roles,
      });
    });
  });
});
