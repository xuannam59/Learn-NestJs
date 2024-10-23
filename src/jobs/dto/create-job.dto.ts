import { Type } from "class-transformer";
import { IsArray, IsDate, IsDefined, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
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

    @IsArray()
    @IsString({ each: true, message: "skill có định dạng string" })
    @IsNotEmpty({ message: "Skill không được để trống" })
    skills: string[]

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "Location không được để trống" })
    location: string

    @IsNotEmpty({ message: "Salary không được để trống" })
    salary: string

    @IsNotEmpty({ message: "Quantity không được để trống" })
    quantity: string

    @IsNotEmpty({ message: "Level không được để trống" })
    level: string

    @IsNotEmpty({ message: "startDate không được để trống" })
    @IsDate({ message: "startDate có định dạng là Date" })
    startDate: Date

    @IsNotEmpty({ message: "endDate không được để trống" })
    @IsDate({ message: "endDate có định dạng là Date" })
    endDate: Date
}
