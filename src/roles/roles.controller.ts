import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Roles")
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  // [POST] /api/v1/roles
  @Post()
  @ResponseMessage("Create a new role")
  create(
    @Body() createRoleDto: CreateRoleDto,
    @User() user: IUser
  ) {
    return this.rolesService.create(createRoleDto, user);
  }

  // [GET] /api/v1/roles?current=1&pageSize=5
  @Get()
  @ResponseMessage("Fetch roles with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.rolesService.findAll(+currentPage, +pageSize, qs);
  }

  // [GET] /api/v1/roles/:id
  @Get(':id')
  @ResponseMessage("Fetch a role by id")
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  // [PATCH] /api/v1/roles
  @Patch(':id')
  @ResponseMessage("Update role by id")
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: IUser
  ) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  // [DELETE] /api/v1/roles
  @Delete(':id')
  @ResponseMessage("Delete role by id")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.rolesService.remove(id, user);
  }
}
