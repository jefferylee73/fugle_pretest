import {
  Controller,
  Get,
  HttpStatus,
  Res,
  Query,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { AppService } from './app.service';
import { IpUserThrottlerGuard } from './guards/ip_user_throttler.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/data')
  @UseGuards(IpUserThrottlerGuard)
  async getTopStory(@Query('user') user: number, @Res() res: Response) {
    const config: AxiosRequestConfig = {
      url: 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty',
      method: 'get',
    };
    try {
      const { data } = await axios(config);
      res.status(HttpStatus.OK).json({ result: data });
    } catch (err) {
      throw new HttpException('拿取資料失敗', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
