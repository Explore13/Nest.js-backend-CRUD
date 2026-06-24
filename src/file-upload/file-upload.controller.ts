import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { Role, User } from '../auth/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto?: UploadFileDto,
  ) {
    try {
      if (!file) throw new BadRequestException('File is required');
      const fileData = await this.fileUploadService.uploadFile(
        file,
        uploadFileDto?.description,
        user.id,
      );

      return {
        message: `File ${file.originalname} is uploaded successfully`,
        data: fileData,
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      return {
        message: error?.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async getAllFiles() {
    try {
      const fileData = await this.fileUploadService.findAllFiles();

      return {
        message: `Files are fetched successfully`,
        data: fileData,
        status: HttpStatus.OK,
      };
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      return {
        message: error?.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async removeFile(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const data = await this.fileUploadService.remove(id);
      if (data.isDeleted)
        return { message: `File with ID ${id} is deleted`, data: data.data };
      return { message: `Post with ID ${id} is not deleted`, data: data.data };
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      return {
        message: error?.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
