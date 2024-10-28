import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose, { mongo } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }

  // [POST] /api/v1/roles
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;

    const isExist = await this.roleModel.findOne({ name })
    if (isExist)
      throw new BadRequestException(`Role: ${name} này đã tồn tại`);
    const result = await this.roleModel.create({
      name,
      description,
      isActive,
      permissions,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return {
      _id: result._id,
      createAt: result.createdAt
    };
  }

  // [GET] /api/v1/roles?current=1&pageSize=5
  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    filter.isDeleted = false;

    const defaultLimit = pageSize ? pageSize : 10;

    const totalItems = await this.roleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const offset = (currentPage - 1) * defaultLimit;

    const result = await this.roleModel
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

  // [GET] /api/v1/roles/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("id không hợp lệ");

    const role = await this.roleModel.findOne({
      _id: id,
      isDeleted: false
    }).populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1 } });

    if (!role)
      throw new NotFoundException("Không tìm thấy role này");

    return role;
  }

  // [PATCH] /api/v1/roles
  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("id không hợp lệ");

    return await this.roleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  // [DElETE] /api/v1/roles
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("id không hợp lệ");

    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.roleModel.softDelete({ _id: id });
  }
}
