import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {
    @IsNotEmpty({ message: "email không được để trống" })
    @IsEmail({}, { message: "email không đúng định dạng" })
    email: string;

    @IsNotEmpty({ message: "name không được để trống" })
    name: string

    @IsNotEmpty({ message: "skills không được để trống" })
    @IsArray({ message: "skills có dạng là array" })
    @IsString({ each: true, message: "skill định dạng là string" })
    skills: string[]
}
