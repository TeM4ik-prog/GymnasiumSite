import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Header, Res, UseGuards, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import * as fs from 'fs';
import { Response } from 'express';
import * as path from 'path';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserId } from '@/userid.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  findAllMy(@UserId() userId: string) {
    console.log(userId)
    return this.commentService.findAllMy(userId)
  }

  @Get(':filename')
  @Header('Content-Type', 'video/mp4')
  async getVideo(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = path.resolve('', 'uploads/videos', filename)

    console.log(videoPath)

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    console.log(filename)

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
      });

      file.pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': fileSize });
      fs.createReadStream(videoPath).pipe(res);
    }
  }

  @Delete('me/:id')
  @UseGuards(JwtAuthGuard)
  deleteMyComment(@Param('id') id: string, @UserId() userId: string) {
    return this.commentService.removeUserComment(id, userId)
  }
  @Patch('me/:id')
  @UseGuards(JwtAuthGuard)
  updateMyComment(@Param('id') id: string, @Body() updateReviewDto: UpdateCommentDto, @UserId() userId: string) {
    return this.commentService.updateUserComment(id, updateReviewDto, userId)

  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('sourceFile'))
  async createReview(
    @Body() body: { text: string },
    @UploadedFile() sourceFile,
    @UserId() userId: string
  ) {
    return this.commentService.create(body.text, `${(sourceFile.destination).slice(1)}/${sourceFile.filename}`, userId)
  }



  @Get()
  findAll() {
    return this.commentService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateReview(@Param('id') id: string, @Body() updateReviewDto: UpdateCommentDto) {
    return this.commentService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    console.log('delete')
    return this.commentService.remove(id);
  }
}
