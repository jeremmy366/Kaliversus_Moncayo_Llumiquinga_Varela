import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // ...
      const { email, password, roles = [UserRole.AUTOR], ...userData } = registerDto;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('El usuario ya existe con este email');
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Buscar los roles
      const userRoles = await this.roleRepository.find({
        where: roles.map(role => ({ nombre: role })),
      });
      // ...

      // Crear el usuario
      const user = this.userRepository.create({
        ...userData,
        email,
        passwordHash,
        roles: userRoles,
      });
      // ...

      const savedUser = await this.userRepository.save(user);
      // ...

      // Retornar usuario sin contraseña y con token
      const { passwordHash: _, ...userWithoutPassword } = savedUser;
      const payload = { sub: savedUser.id, email: savedUser.email, roles: userRoles.map(r => r.nombre) };
      const token = this.jwtService.sign(payload);

      return {
        user: userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      // ...
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario con roles
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles.map(role => role.nombre) 
    };
    const token = this.jwtService.sign(payload);

    // Retornar usuario sin contraseña
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
