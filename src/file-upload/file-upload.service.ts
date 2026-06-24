import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileEntity } from './file.entity';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel(FileEntity) private readonly fileRepository: typeof FileEntity,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    description: string | undefined | null,
    uploaderId: number,
  ) {
    // upload the file to cloudinary
    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    // upload metadata into db

    const newUpload = await this.fileRepository.create({
      originalName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      url: uploadedFile?.secure_url,
      publicId: uploadedFile?.public_id,
      description,
      uploaderId,
    });

    return newUpload;
  }

  async findAllFiles() {
    return await this.fileRepository.findAll({
      include: [
        {
          association: 'uploader',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async remove(id: string) {
    const fileToBeDeleted = await this.fileRepository.findByPk(id);

    if (!fileToBeDeleted)
      throw new NotFoundException(`File with the Id ${id} not found`);

    // await this.cloudinaryService.deleteFile(fileToBeDeleted.publicId); // we are using soft-delete so do not delete from the cloudinary
    await fileToBeDeleted.destroy();

    return { data: fileToBeDeleted, isDeleted: true };
  }
}
