import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

// Data transfer object => class = { }
export class CreateUserDto {
    @IsNotEmpty({ message: "Name không được để trống", })
    name: string;

    @IsEmail({}, { message: "Email không đúng định dạng", })
    @IsNotEmpty({ message: "Email không được để trống", })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống", })
    password: string;

    @IsNotEmpty({ message: "Age không được để trống" })
    age: number;

    @IsNotEmpty({ message: "Role không được để trống" })
    gender: string;

    @IsNotEmpty({ message: "address không được để trống" })
    address: string;

    @IsNotEmpty({ message: "role không được để trống" })
    @IsMongoId({ message: "role có định dạng là ObjectId" })
    role: mongoose.Schema.Types.ObjectId;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {
    @IsNotEmpty({ message: "Name không được để trống", })
    name: string;

    @IsEmail({}, { message: "Email không đúng định dạng", })
    @IsNotEmpty({ message: "Email không được để trống", })
    email: string;

    @IsNotEmpty({ message: "Password không được để trống", })
    password: string;

    @IsNotEmpty({ message: "Age không được để trống" })
    age: number;

    @IsNotEmpty({ message: "Role không được để trống" })
    gender: string;

    @IsNotEmpty({ message: "address không được để trống" })
    address: string;
}
