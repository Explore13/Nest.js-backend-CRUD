import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { IPost } from './interface/post.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Role, User } from '../auth/users.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindPostsQueryDto } from './dto/find-posts-query.dto';
import { PaginatedResponse } from '../common/interface/paginated-response.interface';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class PostsService {
  private postListCacheKeys: Set<string> = new Set();
  private ttl: number = 60000;

  constructor(
    @InjectModel(Post)
    private postModel: typeof Post,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // create a cache key
  private generatePostsListCacheKey(query: FindPostsQueryDto): string {
    const { page = 1, limit = 1, title } = query;
    return `posts_list_page${page}_limit${limit}_title${title || 'all'}`;
  }

  // find all posts
  async findAll(query: FindPostsQueryDto): Promise<PaginatedResponse<Post>> {
    // generate the cache key
    const cacheKey = this.generatePostsListCacheKey(query);

    // stored into cache
    this.postListCacheKeys.add(cacheKey);

    // find the cache data
    const cachedData =
      await this.cacheManager.get<PaginatedResponse<Post>>(cacheKey);

    // if cachedata just return it
    if (cachedData) {
      console.log(`Cache hit --> returning the data from cache ${cacheKey}`);
      return cachedData;
    }

    console.log(`Cache missed --> returning the data from database`);

    // if not, make a custom query
    const { page = 1, limit = 1, title } = query;

    const skip = (page - 1) * limit;

    const where: WhereOptions = {};

    if (title) {
      where.title = {
        [Op.like]: `%${title}%`,
      };
    }

    const { rows: items, count: totalItems } =
      await this.postModel.findAndCountAll({
        where,
        include: [
          {
            association: 'author',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
        order: [['createdAt', 'DESC']],
        offset: skip,
        limit,
      });

    // generate the response

    const totalPages = Math.ceil(totalItems / limit);

    const responseData = {
      items: items,
      meta: {
        currentPage: page,
        totalItems,
        totalPages,
        itemsPerPage: limit,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
    // store into cache and return the data

    await this.cacheManager.set(cacheKey, responseData, this.ttl);
    return responseData;
  }

  // find post by ID
  async findById(id: number): Promise<Post> {
    const cacheKey = `post_id${id}`;
    this.postListCacheKeys.add(cacheKey);

    const cachedData = await this.cacheManager.get<Post>(cacheKey);

    if (cachedData) {
      console.log(`Cache hit --> Getting data from cache --> ${cacheKey}`);
      return cachedData;
    }

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

    console.log(`Cache missed --> Getting data from database --> ${cacheKey}`);

    await this.cacheManager.set(cacheKey, post, this.ttl);
    return post;
  }

  // create new post
  async createPost(
    createPostData: CreatePostDto,
    authorId: number,
  ): Promise<Post> {
    const newPost = this.postModel.create(
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

    await this.invalidateExistingCache();

    return newPost;
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

    const updatedData = await post.update(newPostData);
    await this.invalidateExistingCache();
    return updatedData;
  }

  // delete a post
  async deletePost(id: number): Promise<{ data: Post; isDeleted: boolean }> {
    const post = await this.findPostOrThrow(id);
    await post.destroy();
    await this.invalidateExistingCache();

    return { data: post, isDeleted: true };
  }

  // restore a soft deleted post

  async restorePost(id: number): Promise<{ data: Post; isRestored: boolean }> {
    const post = await this.findPostOrThrow(id, false);

    await post.restore();
    await this.invalidateExistingCache();

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

  private async invalidateExistingCache(): Promise<void> {
    console.log(`Invalidating ${this.postListCacheKeys.size} cache entries`);

    for (const key of this.postListCacheKeys) {
      console.log(key + '\n');

      await this.cacheManager.del(key);
    }

    this.postListCacheKeys.clear();
  }
}
