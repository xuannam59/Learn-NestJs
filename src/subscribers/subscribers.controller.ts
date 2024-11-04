import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/user.interface';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Subscribers")
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  // [POST] /api/v1/subscribers
  @Post()
  @ResponseMessage("Create a new subscriber")
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @User() user: IUser
  ) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  // [GET] /api/v1/subscribers?
  @Get()
  @ResponseMessage("Fetch subscribers with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.subscribersService.findAll(+currentPage, +pageSize, qs);
  }

  // [GET] /api/v1/subscribers/skills
  @Post("skills")
  @SkipCheckPermission()
  @ResponseMessage("Get subscriber's skill")
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  // [GET] /api/v1/subscribers/:id
  @Get(':id')
  @ResponseMessage("Fetch a subscriber by id")
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  // [PATCH] /api/v1/subscribers/:id
  @Patch()
  @SkipCheckPermission()
  @ResponseMessage("Update subscriber by id")
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  // [DELETE] /api/v1/subscribers/:id
  @Delete(':id')
  @ResponseMessage("Delete subscriber by id")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
