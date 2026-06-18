import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

interface LoginRequestBody {
  email?: string;
  password?: string;
}

type LoginRequest = Request<Record<string, never>, unknown, LoginRequestBody>;

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  // modify the getTracker
  protected async getTracker(req: LoginRequest): Promise<string> {
    const email = req.body.email?.trim().toLowerCase() || 'unknown';
    return Promise.resolve(`login:${email}`);
  }
  // set limit to 5 attempts
  //   protected getLimit(): Promise<number> {
  //     return Promise.resolve(5);
  //   }

  // set time window for 1 min
  //   protected getTtl(): Promise<number> {
  //     return Promise.resolve(60000);
  //   }

  // set the exception
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many login attempts. Please try again after 1 minute.',
    );
  }
}
