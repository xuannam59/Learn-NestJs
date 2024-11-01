import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);

    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,

        private configService: ConfigService,
        private userService: UsersService
    ) { }
    async onModuleInit() {
        const init = this.configService.get<string>("SHOULD_INIT");
        if (Boolean(init)) {
            // tạo data permission
            const countUser = await this.userModel.countDocuments({});
            const countRole = await this.roleModel.countDocuments({});
            const countPermission: number = await this.permissionModel.countDocuments({});
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
            }

            // tạo role rồi gán giá trị permission
            if (countRole === 0) {
                const adminPermissions = await this.permissionModel.find({}).select("_id");

                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: "ADMIN có tất cả các quyền",
                        isActive: true,
                        permissions: adminPermissions
                    },
                    {
                        name: USER_ROLE,
                        description: "Người dùng/Ứng viên sử dụng hệ thống",
                        isActive: true,
                        permissions: [] // không set quyền, chỉ cần add ROLE
                    }
                ])
            }

            // tạo user rồi gán giá trị role
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE }).select("_id");
                const userRole = await this.roleModel.findOne({ name: USER_ROLE }).select("_id");
                await this.userModel.insertMany([
                    {
                        name: "I'm admin",
                        email: "admin@gmail.com",
                        password: this.userService.handelPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 50,
                        gender: "male",
                        address: "Nội Duệ - Tiên Du - Bắc Ninh",
                        role: adminRole?._id
                    },
                    {
                        name: "I'm XuanNam",
                        email: "leeminhnam2k2@gmail.com",
                        password: this.userService.handelPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 22,
                        gender: "male",
                        address: "Nội Duệ - Tiên Du - Bắc Ninh",
                        role: adminRole?._id
                    },
                    {
                        name: "Lê Văn A",
                        email: "levana@gmail.com",
                        password: this.userService.handelPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 20,
                        gender: "female",
                        address: "Nội Duệ - Tiên Du - Bắc Ninh",
                        role: userRole?._id
                    }
                ])
            }
            if (countUser > 0 && countPermission > 0 && countRole > 0) {
                this.logger.log(">>> ALREADY INIT SAMPLE DATA...")
            }
        }
    }
}
