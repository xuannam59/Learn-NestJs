import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './user.interface';
import aqp from 'api-query-params';


@Injectable()
export class UsersService {
  constructor(@InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>) { }

  handelPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  // [POST] /auth/user
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user

    // logic check email
    const isExist = await this.userModel.findOne({
      email: email,
      isDeleted: false
    })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. vui lòng sử dụng email khác.`);
    }

    const hashPassword = this.handelPassword(password);
    const newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: "USER"
    });
    return newRegister;
  }

  // [POST] /user
  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, role, address, company } = createUserDto

    // logic check email
    const isExist = await this.userModel.findOne({
      email: email,
      isDeleted: false
    })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. vui lòng sử dụng email khác.`);
    }

    const hashPassword = this.handelPassword(password);

    const newUser = await this.userModel.create({
      name, email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return newUser;
  }

  // [GET] /user
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs)
    delete filter.current;
    delete filter.pageSize;

    let defaultLimit = limit ? limit : 10;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let offset = (currentPage - 1) * (defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select("-password")
      .exec();
    return {
      meta: {
        currentPage: currentPage,
        limit: defaultLimit,
        totalItems: totalItems,
        totalPage: totalPages
      },
      result: result
    };
  }

  // [GET] /user/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Không tìm thấy user")

    const user: any = await this.userModel.findOne({
      _id: id
    })
      .select("-password")
      .populate({ path: "role", select: { name: 1, _id: 1 } });
    return user;
  }

  async findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).
      populate({ path: "role", select: { name: 1, permissions: 1 } });
  }

  isValidPassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  // [PATCH] /user
  async update(updateUserDto: UpdateUserDto, user: IUser) {
    const isExist = await this.userModel.findOne({
      _id: updateUserDto._id,
      isDeleted: false
    })
    if (!isExist) {
      throw new BadRequestException("User không hợp lệ");
    }
    const updated = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }

  // [DELETE] /user/:id
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("User không hợp lệ");
    }

    const foundUser = await this.userModel.findById(id)
    if (foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xoá tài khoản admin");
    }

    await this.userModel.updateOne({
      _id: id
    }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    });
    return this.userModel.softDelete({
      _id: id,
    });
  }

  // update refresh token vào database
  updateRefreshToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  // find user by refresh token
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).select("-password");
  }
}
