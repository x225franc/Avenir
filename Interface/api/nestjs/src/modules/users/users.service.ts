import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { UserId } from '@domain/value-objects/UserId';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(UserId.fromString(id));

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      emailVerified: user.emailVerified,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll() {
    const users = await this.userRepository.findAll();

    return users.map(user => ({
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      emailVerified: user.emailVerified,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
    }));
  }

  async findByRole(role: string) {
    const users = await this.userRepository.findByRole(role);

    return users.map(user => ({
      id: user.id.value,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }
}
