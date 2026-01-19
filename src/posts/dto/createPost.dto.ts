import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title can not be empty' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be minimum of 3 characters' })
  @MaxLength(50, { message: 'Title can not be  longer than 50 characters' })
  title: string;

  @IsNotEmpty({ message: 'Content can not be empty' })
  @IsString({ message: 'Content must be a string' })
  @MinLength(5, { message: 'Content must be minimum of 5 characters' })
  content: string;

  @IsNotEmpty({ message: 'Author name can not be empty' })
  @IsString({ message: 'Author name must be a string' })
  @MinLength(2, { message: 'Author name must be minimum of 2 characters' })
  @MaxLength(100, {
    message: 'Author name can not be  longer than 100 characters',
  })
  author: string;
}
