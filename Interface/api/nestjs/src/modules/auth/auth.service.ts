import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRepository } from '@infrastructure/database/postgresql/UserRepository';
import { AccountRepository } from '@infrastructure/database/postgresql/AccountRepository';
import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';
import { RegisterUser } from '@application/use-cases/user/RegisterUser';
import { LoginUser } from '@application/use-cases/user/LoginUser';
import { VerifyEmail } from '@application/use-cases/user/VerifyEmail';
import { RequestPasswordReset } from '@application/use-cases/user/RequestPasswordReset';
import { ResetPassword } from '@application/use-cases/user/ResetPassword';
import { emailService } from '@infrastructure/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private accountRepository: AccountRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Utiliser le Use Case RegisterUser
      const registerUserUseCase = new RegisterUser(
        this.userRepository,
        this.accountRepository
      );

      const result = await registerUserUseCase.execute({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        address: registerDto.address,
        role: registerDto.role || 'client',
      });

      if (!result.success) {
        throw new BadRequestException(result.error || 'Erreur lors de l\'inscription');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Inscription réussie ! Vérifiez votre email.',
        data: {
          userId: result.userId,
          verificationToken: result.verificationToken,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de l\'inscription');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Utiliser le Use Case LoginUser
      const loginUserUseCase = new LoginUser(this.userRepository);

      const result = await loginUserUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (!result.success) {
        throw new UnauthorizedException(result.error || 'Email ou mot de passe incorrect');
      }

      // Générer le token avec NestJS JwtService au lieu d'utiliser celui du Use Case
      const token = this.generateToken(result.userId!, result.email!, result.role!);

      // Récupérer les informations complètes de l'utilisateur
      const email = new Email(result.email!);
      const user = await this.userRepository.findByEmail(email);

      // Format de réponse compatible avec Express pour respecter la Clean Architecture
      return {
        success: true,
        message: 'Connexion réussie',
        data: {
          token: token,
          userId: user!.id.value,
          email: user!.email.value,
          role: user!.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException((error as Error).message || 'Erreur lors de la connexion');
    }
  }

  async verifyEmail(token: string) {
    try {
      // Utiliser le Use Case VerifyEmail
      const verifyEmailUseCase = new VerifyEmail(this.userRepository);

      const result = await verifyEmailUseCase.execute(token);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Token de vérification invalide ou expiré');
      }

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: result.message || 'Email vérifié avec succès',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException((error as Error).message || 'Erreur lors de la vérification de l\'email');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      // Utiliser le Use Case RequestPasswordReset
      const requestPasswordResetUseCase = new RequestPasswordReset(
        this.userRepository,
        emailService
      );

      await requestPasswordResetUseCase.execute(forgotPasswordDto.email);

      // Ne pas révéler si l'email existe ou non (sécurité)
      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      };
    } catch (error) {
      // Toujours retourner le même message pour la sécurité
      return {
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Utiliser le Use Case ResetPassword
      const resetPasswordUseCase = new ResetPassword(this.userRepository);

      await resetPasswordUseCase.execute(
        resetPasswordDto.token,
        resetPasswordDto.newPassword
      );

      // Format standardisé compatible avec Express
      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Token de réinitialisation invalide ou expiré'
      );
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(UserId.fromString(userId));

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Format de réponse compatible avec Express pour respecter la Clean Architecture
    return {
      success: true,
      data: {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    };
  }

  generateToken(userId: string, email: string, role: string): string {
    const payload = { userId, email, role };
    return this.jwtService.sign(payload);
  }
}
