import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileType } from './entities/file.entity';
import { CustomThrottle } from '../common/decorators/custom-throttle.decorator';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/video')
  @CustomThrottle('upload-video', { limit: 10, ttl: 3600000 }) // 10 uploads per hour
  @ApiOperation({ summary: 'Upload video file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.VIDEO);
  }

  @Post('upload/pdf')
  @CustomThrottle('upload-pdf', { limit: 10, ttl: 3600000 }) // 10 uploads per hour
  @ApiOperation({ summary: 'Upload PDF file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'PDF uploaded successfully' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.PDF);
  }

  @Post('upload/image')
  @CustomThrottle('upload-image', { limit: 20, ttl: 3600000 }) // 20 uploads per hour (images more common)
  @ApiOperation({ summary: 'Upload image file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.IMAGE);
  }

  @Post('upload/thumbnail')
  @CustomThrottle('upload-thumbnail', { limit: 20, ttl: 3600000 }) // 20 uploads per hour
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.IMAGE);
  }

  @Post('upload/avatar')
  @CustomThrottle('upload-avatar', { limit: 5, ttl: 3600000 }) // 5 uploads per hour (avatars rarely change)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.IMAGE);
  }

  @Post('upload/document')
  @CustomThrottle('upload-document', { limit: 10, ttl: 3600000 }) // 10 uploads per hour
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.filesService.uploadFile(file, req.user.id, FileType.DOCUMENT);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    return this.filesService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get file metadata by ID' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/url')
  @CustomThrottle('presigned-url', { limit: 100, ttl: 60000 }) // 100 requests per minute
  @ApiOperation({ summary: 'Get presigned URL for private file access (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Temporary signed URL' },
        expiresIn: { type: 'number', description: 'Expiration time in seconds' }
      }
    }
  })
  async getSignedUrl(@Param('id') id: string) {
    const url = await this.filesService.getPresignedUrl(id, 3600); // 1 hora
    return {
      url,
      expiresIn: 3600,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete file (soft delete)' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
