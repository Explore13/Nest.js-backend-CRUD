import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Name can not be empty' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be minimum of 3 characters' })
  @MaxLength(50, { message: 'Name can not be  longer than 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'Password can not be empty' })
  @MinLength(6, { message: 'Password must be minimum of 6 characters' })
  password: string;
}
