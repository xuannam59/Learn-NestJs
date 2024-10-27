import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume {
    @Prop()
    email: string;

    @Prop()
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    url: string;

    @Prop()
    status: string; // PENDING-REVIEWING-APPROVED-REJECTED

    @Prop()
    companyId: mongoose.Schema.Types.ObjectId;

    @Prop()
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop()
    history: [
        {
            status: string,
            updatedAt: Date,
            updatedBy: {
                _id: mongoose.Schema.Types.ObjectId,
                email: string
            }
        }
    ]

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: Boolean;

    @Prop()
    deletedAt: Date;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
