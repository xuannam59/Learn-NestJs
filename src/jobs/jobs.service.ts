import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import dayjs from 'dayjs';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }

  // [POST] /api/v1/jobs
  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name, skills, salary,
      company, quantity, level,
      description, startDate, endDate, isActive, location } = createJobDto

    const compareDate = dayjs(endDate).isAfter(startDate);
    if (!compareDate) {
      throw new BadRequestException("Ngày kết thuc phải sau ngày bắt đầu");
    }

    const newJob = await this.jobModel.create({
      name, skills, salary,
      company, quantity, level,
      description, startDate, endDate, isActive, location,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newJob._id,
      createdAt: newJob.createdAt
    };
  }

  // [GET] /api/v1/jobs?current=1&pageSize=5
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize

    let defaultLimit = limit ? limit : 10;

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil((totalItems) / defaultLimit);
    const offset = (currentPage - 1) * defaultLimit;
    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: result
    };
  }

  // [GET] /api/v1/jobs/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "not found job";

    return await this.jobModel.findById(id);
  }

  // [PATCH] /api/v1/jobs/:id
  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const result = await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return result;
  }

  // [DELETE] /api/v1/jobs/:id
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "not found job";

    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return await this.jobModel.softDelete({ _id: id });
  }
}
