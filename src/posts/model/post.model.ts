import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { IPost } from '../interface/post.interface';
import { Optional } from 'sequelize';
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
}
