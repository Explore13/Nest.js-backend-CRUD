import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from './post.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  // this will make the post repository available for injection
  imports: [SequelizeModule.forFeature([Post]), CacheModule.register()],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
