import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdatedBy {
    @IsNotEmpty()
    _id: string

    @IsNotEmpty()
    @IsEmail()
    email: string
}


class History {
    @IsNotEmpty()
    status: string

    @IsNotEmpty()
    updatedAd: Date

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UpdatedBy)
    updatedBy: UpdatedBy
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
    @IsNotEmpty({ message: "history không được để trống" })
    @IsArray({ message: "history có dạng là một array" })
    @ValidateNested()
    @Type(() => History)
    history: History[]
}
