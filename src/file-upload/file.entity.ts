import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../auth/users.entity';

@Table({
  tableName: 'files',
  timestamps: true,
  paranoid: true,
})
export class FileEntity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column
  declare originalName: string;

  @Column
  declare mimeType: string;

  @Column
  declare size: number;

  @Column
  declare url: string;

  @Column
  declare publicId: string;

  @Column({ allowNull: true })
  declare description: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
  })
  declare uploaderId: number;

  @BelongsTo(() => User, 'uploaderId')
  declare uploader: User;
}
