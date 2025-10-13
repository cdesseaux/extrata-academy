import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { keycloakId } });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findOrCreateFromKeycloak(keycloakUser: any): Promise<User> {
    let user = await this.findByKeycloakId(keycloakUser.id);
    
    if (!user) {
      user = await this.create({
        keycloakId: keycloakUser.id,
        email: keycloakUser.email,
        firstName: keycloakUser.firstName,
        lastName: keycloakUser.lastName,
        username: keycloakUser.username,
        roles: keycloakUser.roles,
      });
    } else {
      // Atualiza dados do usuário se necessário
      const updatedUser = await this.update(user.id, {
        email: keycloakUser.email,
        firstName: keycloakUser.firstName,
        lastName: keycloakUser.lastName,
        username: keycloakUser.username,
        roles: keycloakUser.roles,
      });
      user = updatedUser || user;
    }

    return user;
  }
}
