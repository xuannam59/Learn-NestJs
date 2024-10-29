import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { use } from 'passport';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>
  ) { }

  // [POST] /api/v1/resumes
  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const {
      url, companyId, jobId
    } = createResumeDto;

    const newResume = await this.resumeModel.create({
      email: user.email,
      userId: user._id,
      url,
      companyId,
      jobId,
      status: "PENDING",
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ],
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newResume._id,
      createdAt: newResume.createdAt
    };
  }

  // [GET] /api/v1/resumes?current=1&pageSize=5
  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let defaultLimit = pageSize ? pageSize : 10;

    const totalItems = await this.resumeModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const offset = (currentPage - 1) * defaultLimit;

    const result = await this.resumeModel
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
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems
      },
      result: result
    };
  }

  // [GET] /api/v1/resumes/:id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Not found resume")
    const result = await this.resumeModel.findOne({ _id: id });
    return result;
  }

  // [PATCH] /api/v1/resumes/:id
  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Not found resume")

    return await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        },
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  // [DELETE] /api/v1/resumes/:id
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("Not found resume")

    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.resumeModel.softDelete({ _id: id });
  }

  // [POST] /api/v1/resumes/by-user
  async findByUsers(user: IUser) {
    const result = await this.resumeModel.find({
      userId: user._id
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ]);
    return result;
  }
}
