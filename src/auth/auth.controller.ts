import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorators';
import { RolesGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorators';
import { Role, User } from './users.entity';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
// import { SkipThrottle, Throttle } from '@nestjs/throttler';

// @SkipThrottle() // @SkipThrottle is a decorator that helps to skip the rate limit for that particular route or controller

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // custom throttler for a specific route
  // @Throttle({
  //   default: {
  //     ttl: 10000,
  //     limit: 4,
  //   },
  // })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerData: RegisterDto) {
    try {
      return this.authService.register(registerData);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `User registrartion failed`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  // @SkipThrottle({ default: false }) // whole controller is skipped rom rate limiting but this route will have rate limiting
  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.FOUND)
  login(@Body() loginData: LoginDto) {
    try {
      return this.authService.login(loginData);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `User login failed.`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body('refreshToken') refreshToken: string) {
    try {
      return this.authService.refreshToken(refreshToken);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Invalid token.`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  // protected route
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.FOUND)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  registerAdmin(@Body() registerData: RegisterDto) {
    try {
      return this.authService.registerAdmin(registerData);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Admin registrartion failed`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
