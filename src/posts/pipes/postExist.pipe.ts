import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostExistPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}
  async transform(value: number) {
    try {
      await this.postService.findById(value);
    } catch (e) {
      console.log('Error during checking post exist : ', e);

      throw new NotFoundException(`Post with ID ${value} not found`);
    }
    // return value + 1; // if I change this value then the id in controller will be +1 and it will return the next post

    return value;
  }
}
