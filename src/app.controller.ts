import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService // cách sử dụng env trong controller
  ) { }

  @Get()
  @Render("home") // server side rendering , k được return
  handleHomePage() {
    const message = this.appService.getHello();
    console.log(this.configService.get<string>("PORT")); // cách sử dụng env trong controller
    return {
      message: message
    }
  }
}
