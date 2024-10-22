import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './user.interface';

@Controller('users') // => /user
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // [POST] /user
  @Post()
  @ResponseMessage("Create a new User")
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    const newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  // [GET] /user
  @Get()
  @ResponseMessage("Fetch user with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  // [GET] /user/:id
  @Public()
  @Get(':id')
  @ResponseMessage("Fetch User by id")
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id)
    return foundUser;
  }

  // [PATCH] /user
  @Patch()
  @ResponseMessage("Update a User")
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    const updatedUser = await this.usersService.update(updateUserDto, user)
    return updatedUser;
  }

  // [DELETE] /user/:id
  @Delete(':id')
  @ResponseMessage("Delete a User")
  async remove(@Param('id') id: string, @User() user: IUser) {
    const deletedUser = await this.usersService.remove(id, user)
    return deletedUser;
  }
}
