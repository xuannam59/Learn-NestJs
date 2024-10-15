import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) { }

  handelPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  // [POST] /user
  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.handelPassword(createUserDto.password);
    const user = await this.userModel.create({
      email: createUserDto.email, password: hashPassword, name: createUserDto.name
    });
    return user;
  }

  // [GET] /user
  findAll() {
    return `This action returns all users`;
  }

  // [GET] /user/:id
  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "not found";

    return this.userModel.findOne({
      _id: id
    });
  }

  async findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    });
  }

  isValidPassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  // [PATCH] /user
  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({
      _id: updateUserDto._id
    }, {
      ...updateUserDto
    });
  }

  // [DELETE] /user/:id
  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "not found"

    return this.userModel.softDelete({
      _id: id
    });
  }
}
