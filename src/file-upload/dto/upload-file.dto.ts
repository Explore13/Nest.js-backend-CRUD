import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString({ message: 'Decsription must be a string' })
  @MaxLength(100, {
    message: "Description can't exceed 100 characters",
  })
  description?: string;
}
