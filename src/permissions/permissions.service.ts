import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }


  // [POST] /api/v1/permissions
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto;

    const isExist = await this.permissionModel.findOne({
      apiPath,
      method
    })

    if (isExist)
      throw new BadRequestException(`Permission với apiPath: ${apiPath} và method: ${method} đã tồn tại!`);

    const newPermission = await this.permissionModel.create({
      name,
      method,
      apiPath,
      module,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt
    };
  }

  // [GET] /api/v1/permissions
  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    filter.isDeleted = false;

    const defaultLimit = pageSize ? pageSize : 10;

    const totalItems = await this.permissionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const offset = (currentPage - 1) * defaultLimit;

    const result = await this.permissionModel
      .find(filter)
      .limit(defaultLimit)
      .skip(offset)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems
      },
      result: result
    };
  }

  // [GET] /api/v1/permissions/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundException("Không tìm thấy permission này");

    const permission = await this.permissionModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!permission)
      throw new NotFoundException("permission này đã bị xoá");

    return permission;
  }

  // [PATCH] /api/v1/permissions
  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundException("Không tìm thấy permission này");

    return await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundException("Không tìm thấy permission này!");

    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.permissionModel.softDelete({ _id: id });
  }
}
