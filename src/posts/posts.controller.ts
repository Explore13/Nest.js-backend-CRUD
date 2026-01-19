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
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
// import type { IPost as PostInterface } from './interface/post.interface';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostExistPipe } from './pipes/postExist.pipe';
import { Post as PostModule } from './model/post.model';

@Controller('/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  async findAll(@Query('search') search: string): Promise<{
    message: string;
    status: HttpStatus;
    data?: PostModule[] | [];
  }> {
    try {
      let allPosts = await this.postsService.findAll();
      if (search)
        allPosts = allPosts.filter((post) =>
          post.title.toLowerCase().includes(search.toLowerCase()),
        );
      return {
        message: `All posts are fetched successfully`,
        data: allPosts,
        status: HttpStatus.ACCEPTED,
      };
    } catch (error) {
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
  // @HttpCode(HttpStatus.FOUND)
  async findById(
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
  async createPost(@Body() postData: CreatePostDto) {
    try {
      if (!postData)
        throw new HttpException(
          'Post Data can not be empty',
          HttpStatus.BAD_REQUEST,
        );
      const post = await this.postsService.createPost(postData);
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
  ) {
    try {
      console.log('id : ', id);

      const data = await this.postsService.updatePost(id, updatePostData);
      return { message: `Post with ID ${id} is updated successfully`, data };
    } catch (error) {
      console.log(error);
      throw new HttpException('Post is not updated', HttpStatus.NOT_MODIFIED);
    }
  }

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
      throw new HttpException(
        'Post is not deleted successfully',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }
}
