import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ReviewService {
  constructor(
    protected dbService: DatabaseService,
  ) { }

  async create(text: string, sourcePath: string) {
    console.log(text, sourcePath)


    return await this.dbService.review.create({
      data: {
        content: text,
        sourceUrl: sourcePath,
      },
    })
  }

  async findAll() {
    return await this.dbService.review.findMany({
      orderBy:{
        createdAt: 'desc'
      }
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    console.log(id, updateReviewDto)

    return await this.dbService.review.update({
      where: {
        id,
      },
      data: updateReviewDto,
    })
  }

  async delete(id: string) {
    return await this.dbService.review.delete({
      where: { id },
    })
  }
}
