import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role, User } from '../users/users.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';
import { IPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // check if user exists, if exists just throw an execrption

    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser)
      throw new ConflictException(
        `User with the email ID ${registerDto.email} is already found`,
      );
    // if not hash the pass and store the data

    const hashedPassword = await this.hashedPassword(registerDto.password);

    const newUser = await this.userModel.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: Role.USER,
    });

    const { password, ...userWithoutPassword } = newUser.toJSON();
    return { message: 'User created succcessfully', data: userWithoutPassword };
  }

  async registerAdmin(registerDto: RegisterDto) {
    // check if user exists, if exists just throw an execrption

    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser)
      throw new ConflictException(
        `User with the email ID ${registerDto.email} is already found`,
      );
    // if not hash the pass and store the data

    const hashedPassword = await this.hashedPassword(registerDto.password);

    const newUser = await this.userModel.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: Role.ADMIN,
    });

    const { password, ...userWithoutPassword } = newUser.toJSON();
    return {
      message: 'Admin user created succcessfully',
      data: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    // find the user -> if no throw error
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await this.verifyPassword(loginDto.password, user.password)))
      throw new UnauthorizedException(`Invalid credentials or user not found`);

    const { password, ...userWithoutPassword } = user.toJSON();
    const tokens = this.generateTokens(user);

    return { data: userWithoutPassword, ...tokens };
    // return jwt
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: { sub: string | null | undefined } =
        this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_SECRET_REFRESH_TOKEN,
        });

      const user = await this.userModel.findOne({ where: { id: payload.sub } });

      if (!user) throw new UnauthorizedException('Inavlid token ');

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid token ');
    }
  }

  async findUserById(userId: string) {
    const user = await this.userModel.findOne({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('Invalid token');

    const { password, ...result } = user.toJSON();

    return result;
  }

  private async hashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  private generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    // email, sub(id), role ---> RBAC
    const payload: IPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_ACCESS_TOKEN,
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_REFRESH_TOKEN,
      expiresIn: '7d',
    });
  }
}
