import { Injectable, NotFoundException } from '@nestjs/common';
// import { IPost } from './interface/post.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './model/post.model';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';

// @Injectable()
// export class PostsService {
//   // private posts: Post[] = [
//   //   {
//   //     id: 1,
//   //     title: 'First Post',
//   //     content: 'First Content',
//   //     author: 'Surya',
//   //     createdAt: new Date(),
//   //   },
//   //   {
//   //     id: 2,
//   //     title: 'Second Post',
//   //     content: 'Second Content',
//   //     author: 'Surya',
//   //     createdAt: new Date(),
//   //   },
//   // ];

//   constructor(
//     @InjectModel(Post)
//     private readonly postModel: typeof Post,
//   ) {}

//   // find all posts
//   findAll(): Promise<Post[]> {
//     // return this.posts;
//     return this.postModel.findAll();
//   }

//   // find post by Id
//   async findById(id: number): Promise<Post> {
//     // const post = this.posts.find((p) => p.id === id);
//     const post = await this.postModel.findByPk(id);
//     if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
//     return post;
//   }

//   // create new post
//   async createPost(createPostData: CreatePostDto): Promise<Post> {
//     // const newPost: Post = {
//     //   id: this.generatePostId(),
//     //   ...createPostData,
//     //   createdAt: new Date(),
//     // };

//     // this.posts.push(newPost);

//     return await this.postModel.create(createPostData);
//   }

//   // generate new post Id
//   // private generatePostId(): number {
//   //   return this.posts.length > 0
//   //     ? Math.max(...this.posts.map((post) => post.id)) + 1
//   //     : 1;
//   // }

//   // update post
//   async updatePost(id: number, updatePostData: UpdatePostDto) {
//     // const currentPostIndex = this.posts.findIndex((post) => post.id === id);
//     // if (currentPostIndex === -1)
//     // throw new NotFoundException(`Post with ID ${id} is not found.`);
//     // this.posts[currentPostIndex] = {
//     //   ...this.posts[currentPostIndex],
//     //   ...updatePostData,
//     //   updatedAt: new Date(),
//     // };
//     // return this.posts[currentPostIndex];

//     const post = await this.postModel.findByPk(id);
//     if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
//     const newData = {
//       ...post,
//       ...updatePostData,
//     };

//     return await post.update(newData);
//   }

//   // delete post
//   async deletePost(id: number): Promise<{ message: string; data: Post }> {
//     // const currentIndex = this.posts.findIndex((post) => post.id === id);
//     // if (currentIndex === -1)
//     //   throw new NotFoundException(`Post with ID ${id} is not found`);

//     // const post = this.posts[currentIndex];
//     // this.posts.splice(currentIndex, 1)
//     const post = await this.postModel.findByPk(id);
//     if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);

//     await post.destroy();

//     return {
//       message: `Post with ID ${post?.id} is deleted successfully`,
//       data: post,
//     };
//   }
// }

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private postModel: typeof Post,
  ) {}

  // find all posts
  async findAll(): Promise<Post[]> {
    return this.postModel.findAll();
  }

  // find post by ID
  async findById(id: number): Promise<Post> {
    const post = await this.postModel.findByPk(id);
    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    return post;
  }

  // create new post
  createPost(createUserData: CreatePostDto): Promise<Post> {
    return this.postModel.create(createUserData);
  }

  // update a post
  async updatePost(id: number, updatePostData: UpdatePostDto): Promise<Post> {
    const post = await this.postModel.findByPk(id);
    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    const newPostData = {
      ...post,
      ...updatePostData,
    };

    return post.update(newPostData);
  }

  // delete a post
  async deletePost(id: number): Promise<{ data: Post; isDeleted: boolean }> {
    const post = await this.postModel.findByPk(id);
    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    await post.destroy();
    return { data: post, isDeleted: true };
  }
}
