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
})
export class Post extends Model<
  IPost,
  Optional<IPost, 'id' | 'createdAt' | 'updatedAt'>
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare author: string;

  // 1. Define the Foreign Key column
  @ForeignKey(() => User)
  @Column
  userId: number;

  // 2. Define the Association
  @BelongsTo(() => User)
  user: User;
}
