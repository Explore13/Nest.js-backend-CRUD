import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginatedQueryDto } from '../../common/dto/paginated-query.dto';

export class FindPostsQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: "Title search cann't exceed 100 characters" })
  title?: string;
}
