import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { IPost } from './interface/post.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Role, User } from '../users/users.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private postModel: typeof Post,
  ) {}

  // find all posts
  async findAll(): Promise<Post[]> {
    return this.postModel.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
    });
  }

  // find post by ID
  async findById(id: number): Promise<Post> {
    const post = await this.postModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
    });
    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    return post;
  }

  // create new post
  async createPost(
    createPostData: CreatePostDto,
    authorId: number,
  ): Promise<Post> {
    console.log(authorId);

    return this.postModel.create(
      { ...createPostData, authorId },
      {
        include: [
          {
            model: User,
            as: 'author',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
      },
    );
  }

  // update a post
  async updatePost(
    id: number,
    updatePostData: UpdatePostDto,
    author: User,
  ): Promise<Post> {
    const post = await this.findPostOrThrow(id);
    if (author.role !== Role.ADMIN && post.authorId !== author.id) {
      throw new ForbiddenException(`You can not update this post`);
    }
    const newPostData = {
      ...post,
      ...updatePostData,
    };

    await post.update(newPostData);
    return post;
  }

  // delete a post
  async deletePost(id: number): Promise<{ data: Post; isDeleted: boolean }> {
    const post = await this.findPostOrThrow(id);
    await post.destroy();
    return { data: post, isDeleted: true };
  }

  // restore a soft deleted post

  async restorePost(id: number): Promise<{ data: Post; isRestored: boolean }> {
    const post = await this.findPostOrThrow(id, false);

    await post.restore();

    return { data: post, isRestored: true };
  }

  private async findPostOrThrow(
    id: number,
    paranoid: boolean = true,
  ): Promise<Post> {
    const post = await this.postModel.findByPk(id, {
      paranoid,
      include: [
        {
          model: User,
          as: 'author',
          attributes: {
            exclude: ['password'],
          },
        },
      ],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} is not found`);
    }

    return post;
  }
}
