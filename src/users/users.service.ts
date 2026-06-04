import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (user)
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );

    const newUser = await this.userRepository.create({ ...createUserDto });

    return newUser;
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findById(id: number) {
    const user = await this.userRepository.findByPk(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    return await user.update({ ...updateUserDto });
  }

  async remove(id: number) {
    const user = await this.findById(id);
    await user.destroy();
    return { data: user, isDeleted: true };
  }
}
