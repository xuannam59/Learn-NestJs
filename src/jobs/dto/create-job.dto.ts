import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsDateString, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: "Name không được để trống" })
    name: string

    @IsNotEmpty({ message: "Skill không được để trống" })
    @IsArray({ message: "skills có dạng là array" })
    @IsString({ each: true, message: "skill có định dạng string" })
    skills: string[]

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "Salary không được để trống" })
    salary: string

    @IsNotEmpty({ message: "Quantity không được để trống" })
    quantity: string

    @IsNotEmpty({ message: "Level không được để trống" })
    level: string

    @IsNotEmpty({ message: "description không được để trống" })
    description: string

    @IsNotEmpty({ message: "startDate không được để trống" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "startDate có dạng là Date" })
    startDate: Date

    @IsNotEmpty({ message: "endDate không được để trống" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "startDate có dạng là Date" })
    endDate: Date

    location: string
    isActive: boolean
}
