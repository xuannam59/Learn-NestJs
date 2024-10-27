import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { use } from 'passport';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  // [POST] /api/v1/resumes
  @Post()
  @ResponseMessage("Create a new resume")
  create(
    @Body() createResumeDto: CreateResumeDto,
    @User() user: IUser
  ) {
    return this.resumesService.create(createResumeDto, user);
  }

  // [GET] /api/v1/resumes
  @Get()
  @ResponseMessage("Fetch resumes with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.resumesService.findAll(+currentPage, +pageSize, qs);
  }

  // [GET] /api/v1/resumes/:id
  @Get(':id')
  @ResponseMessage("Fetch a resume by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  // [PATCH] /api/v1/resumes
  @Patch(':id')
  @ResponseMessage("Update a resume")
  update(
    @Param('id') id: string,
    @Body("status") status: string,
    @User() user: IUser
  ) {
    return this.resumesService.update(id, status, user);
  }

  // [DELETE] /api/v1/resumes
  @Delete(':id')
  @ResponseMessage("Delete a resume")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.resumesService.remove(id, user);
  }

  // [POST] /api/v1/resumes/by-user
  @Post("/by-user")
  @ResponseMessage("Get resumes by user")
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }
}
