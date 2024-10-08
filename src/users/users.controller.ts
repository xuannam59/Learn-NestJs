import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users') // => /user
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // [POST] /user/eric
  @Post("create") // 
  create(
    @Body() createUserDto: CreateUserDto
  ) {
    return this.usersService.create(createUserDto);
  }

  // [GET] /user
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // [GET] /user/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // [PATCH] /user
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  // [DELETE] /user/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
