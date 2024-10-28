import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  // [POST] /api/v1/permissions
  @Post()
  @ResponseMessage("Create a new permission")
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() user: IUser
  ) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  // [GET] /api/v1/permissions
  @Get()
  @ResponseMessage("Fetch permissions with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.permissionsService.findAll(+currentPage, +pageSize, qs);
  }

  // [GET] /api/v1/permissions/:id
  @Get(':id')
  @ResponseMessage("Fetch a permission by id")
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  // [PATCH] /api/v1/permissions
  @Patch(':id')
  @ResponseMessage("Update permission")
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @User() user: IUser
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  // [DELETE] /api/v1/permissions
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(id, user);
  }
}
