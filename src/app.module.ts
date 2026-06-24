import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { SequelizeModule } from '@nestjs/sequelize';
// import { PostModel } from './posts/model/post.model';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
// import { Post } from './posts/post.entity';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // time to live in ms
          limit: 5, // max req within the ttl
        },
      ],
    }),

    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin123',
      database: 'blog',
      // models: [Post], --> as I wrote autoLoadModels : true, we do not need to mention the models explicitly
      autoLoadModels: true,
      synchronize: true,
      logging: true,
    }),
    PostsModule,
    AuthModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // if we add a provider it will enable for all routes based on IP, even if we define this in any module it works same as APP_GUARD stands for whole nestjs application
    // {
    //   provide: APP_GUARD,

    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
