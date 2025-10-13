import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max
      },
      storage: undefined, // Usar memória, processaremos no service
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
