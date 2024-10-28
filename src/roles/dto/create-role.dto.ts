import { IsArray, IsMongoId, IsNotEmpty, IsObject } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: "Không được để trống name" })
    name: string;

    @IsNotEmpty({ message: "Không được để trống permissions" })
    @IsMongoId({ each: true, message: "each permission có định dạng ObjectId" })
    @IsArray({ message: "permissions có định dạng Array" })
    permissions: mongoose.Schema.Types.ObjectId[]

    @IsNotEmpty({ message: "Không được để trống isActive" })
    isActive: boolean;

    @IsNotEmpty({ message: "Không được để trống description" })
    description: string;
}
