import { IsEmpty } from "class-validator";

export class CreateCompanyDto {
    @IsEmpty({ message: "Name không được để trống!" })
    name: string

    @IsEmpty({ message: "Address không được để trống!" })
    address: string

    @IsEmpty({ message: "Description không được để trống!" })
    description: string
}
