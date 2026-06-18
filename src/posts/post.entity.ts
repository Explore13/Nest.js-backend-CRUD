import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { IPost } from './interface/post.interface';
import { User } from '../users/users.entity';
// import { Post } from '../interface/post.interface';

@Table({
  tableName: 'posts',
  timestamps: true,
  paranoid: true, // Enables soft delete functionality
})
export class Post extends Model<
  IPost,
  Optional<IPost, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare content: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
  })
  declare authorId: number;

  @BelongsTo(() => User, 'authorId')
  declare author: User;
}
