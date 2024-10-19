import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>
  ) { }

  // [POST] /companies
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const company = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return company;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.page;


    let defaultLimit = limit ? limit : 10;

    const totalItems = await this.companyModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let offset = (currentPage - 1) * (defaultLimit);

    const result = await this.companyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        currentPage: currentPage,//trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result: result
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  // [PATCH] /companies/:id
  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return await this.companyModel.updateOne({
      _id: id
    }, {
      ...updateCompanyDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne({
      _id: id,
    }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.companyModel.softDelete({
      _id: id
    });
  }
}
