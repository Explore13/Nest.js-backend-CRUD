import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
// import type { IPost as PostInterface } from './interface/post.interface';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostExistPipe } from './pipes/postExist.pipe';
import { Post as PostModule } from './post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role, User } from '../users/users.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { FindPostsQueryDto } from './dto/find-posts-query.dto';
import { PaginatedResponse } from '../common/interface/paginated-response.interface';
@UseGuards(JwtAuthGuard)
@Controller('/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  async findAll(@Query() query: FindPostsQueryDto): Promise<{
    message: string;
    status: HttpStatus;
    data?: PaginatedResponse<PostModule>;
  }> {
    try {
      const allPosts = await this.postsService.findAll(query);
      return {
        message: `All posts are fetched successfully`,
        data: allPosts,
        status: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Posts are not found`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  @Get('/:id')
  @HttpCode(HttpStatus.FOUND)
  async getPostById(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
  ): Promise<{ message: string; data?: PostModule; status: HttpStatus }> {
    try {
      const post = await this.postsService.findById(id);
      return {
        message: `Post with ID ${id} is fetched successfully`,
        data: post,
        status: HttpStatus.FOUND,
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        return { message: error.message, status: error.getStatus() };
      return {
        message: 'Can not find the Post',
        status: HttpStatus.NOT_FOUND,
      };
    }
  }

  @Post('/create-post')
  @HttpCode(HttpStatus.CREATED)
  // Validation pipeline for this controller method
  // @UsePipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // )
  async createPost(@Body() postData: CreatePostDto, @CurrentUser() user: User) {
    try {
      const post = await this.postsService.createPost(postData, user.id);
      return {
        message: `New Post with ID ${post.id} is created successfullly`,
        data: post,
      };
    } catch (error) {
      console.log(error);

      return { message: 'Error during creating a post' };
    }
  }

  @Put('/update-post/:id')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('id', ParseIntPipe, PostExistPipe) id: number,
    @Body() updatePostData: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    try {
      const data = await this.postsService.updatePost(id, updatePostData, user);
      return { message: `Post with ID ${id} is updated successfully`, data };
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Post is not updated'`,
        status: HttpStatus.NOT_MODIFIED,
      };
    }
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('/delete-post/:id')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id', ParseIntPipe, PostExistPipe) id: number) {
    try {
      const data = await this.postsService.deletePost(id);
      if (data.isDeleted)
        return { message: `Post with ID ${id} is deleted`, data: data.data };
      return { message: `Post with ID ${id} is not deleted`, data: data.data };
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Post is not deleted successfully`,
        status: HttpStatus.NOT_MODIFIED,
      };
    }
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('/restore-post/:id')
  @HttpCode(HttpStatus.OK)
  async restorePost(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.postsService.restorePost(id);
      if (data.isRestored)
        return { message: `Post with ID ${id} is restored`, data: data.data };
      return { message: `Post with ID ${id} is not restored`, data: data.data };
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException)
        return {
          message: error.message,
          status: error.getStatus(),
        };
      return {
        message: `Post can not be restored`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
