import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { emailService } from '@infrastructure/services/email.service';
import { User, UserRole } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { UserId } from '@domain/value-objects/UserId';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const email = new Email(registerDto.email);
      const exists = await this.userRepository.emailExists(email);

      if (exists) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const verificationToken = uuidv4();

      const user = User.create({
        email,
        passwordHash: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        address: registerDto.address,
        role: UserRole.CLIENT,
        emailVerified: false,
        isBanned: false,
        verificationToken,
      });

      await this.userRepository.save(user);

      // Envoyer email de vérification (async, ne pas attendre)
      emailService.sendVerificationEmail(email.value, registerDto.firstName, verificationToken).catch((err: Error) => {
        console.error('Erreur envoi email:', err);
      });

      return {
        message: 'Inscription réussie. Veuillez vérifier votre email.',
        userId: user.id.value,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'inscription');
    }
  }

  async login(loginDto: LoginDto) {
    const email = new Email(loginDto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Votre compte a été banni');
    }

    const token = this.generateToken(user.id.value, user.email.value, user.role);

    return {
      access_token: token,
      user: {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Token de vérification invalide ou expiré');
    }

    user.verifyEmail();
    await this.userRepository.save(user);

    return { message: 'Email vérifié avec succès' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const email = new Email(forgotPasswordDto.email);
      const user = await this.userRepository.findByEmail(email);

      if (user) {
        const resetToken = uuidv4();
        user.setPasswordResetToken(resetToken);
        await this.userRepository.save(user);

        // Envoyer email (async)
        emailService.sendPasswordResetEmail(email.value, user.firstName, resetToken).catch((err: Error) => {
          console.error('Erreur envoi email:', err);
        });
      }

      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        message: 'Un email de réinitialisation a été envoyé si le compte existe',
      };
    } catch (error) {
      return {
        message: 'Un email de réinitialisation a été envoyé si le compte existe',
      };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const users = await this.userRepository.findAll();
    const user = users.find(u => u.passwordResetToken === resetPasswordDto.token);

    if (!user) {
      throw new BadRequestException('Token de réinitialisation invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.resetPassword(hashedPassword);
    await this.userRepository.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(UserId.fromString(userId));

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
    };
  }

  generateToken(userId: string, email: string, role: string): string {
    const payload = { userId, email, role };
    return this.jwtService.sign(payload);
  }
}
