import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose, { mongo } from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  // [POST] /api/v1/subscribers
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { email, name, skills } = createSubscriberDto

    const isExist = await this.subscriberModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã đăng ký subscriber`);
    }

    const newSubscriber = await this.subscriberModel.create({
      email, name, skills,
      createdBy: {
        _id: user?._id,
        email: user?.email
      }
    })

    return {
      _id: newSubscriber?._id,
      createdAt: newSubscriber?.createdAt
    };
  }

  // [GET] /api/v1/subscribers?current=1&pageSize=10
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize

    let defaultLimit = limit ?? 10;
    const totalItems = await this.subscriberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const offset = (currentPage - 1) * defaultLimit;

    const result = await this.subscriberModel
      .find(filter)
      .limit(defaultLimit)
      .skip(offset)
      .sort(sort as any)
      .populate(population)
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

  async getSkills(user: IUser) {
    return await this.subscriberModel.findOne({ email: user.email }).select("skills");
  }

  // [GET] /api/v1/subscribers/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Id không hợp lệ");

    const subscriber = await this.subscriberModel.findOne({ _id: id });
    if (!subscriber)
      throw new NotFoundException("Không tìm thấy subscriber");


    return subscriber;
  }

  // [PATCH] /api/v1/subscribers/:id
  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email
        }
      },
      {
        upsert: true // update and insert nếu chưa có record thì tạo bản record
      }
    );
  }

  // [DELETE] /api/v1/subscribers/:id
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Id không hợp lệ");

    const subscriber = await this.subscriberModel.findOne({ _id: id });
    if (!subscriber)
      throw new NotFoundException("Không tìm thấy subscriber");
    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email
        }
      }
    );

    return this.subscriberModel.softDelete({ _id: id });
  }
}
