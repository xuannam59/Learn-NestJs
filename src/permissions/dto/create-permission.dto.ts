import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: "Không được để trống name" })
    name: string;

    @IsNotEmpty({ message: "Không được để trống apiPath" })
    apiPath: string;

    @IsNotEmpty({ message: "Không được để trống method" })
    method: string;

    @IsNotEmpty({ message: "Không được để trống module" })
    module: string;
}
