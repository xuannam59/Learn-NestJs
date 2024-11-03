import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) { }




  @Get()
  @Public()
  @ResponseMessage("Test email")
  @Cron('0 0 0 * * 0') // 0.10' ar every sunday
  //     * * * * * *
  //     | | | | | |
  //     | | | | | day of week (0-6)
  //     | | | | months(0-11)
  //     | | | day of month
  //     | | hours (0-23)
  //     | minutes (0-59)
  //     seconds (optional) (0-59)
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({})
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
      if (jobWithMatchingSkills?.length > 0) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
            skills: item.skills
          }
        });
        await this.mailerService.sendMail({
          to: "lmx.nam592002@gmail.com",
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: "new-job",
          context: {
            receiver: subs.name,
            jobs: jobs
          }
        });
      }
    }
    console.log("Sent mail")
  }
}
