import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TwoFaSetupDto, TwoFaVerifyDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto);
    return this.authService.login(user, false);
  }

  @Public()
  @Post('2fa/verify')
  async verify2fa(@Body() dto: TwoFaVerifyDto) {
    return this.authService.verify2fa(dto.email, dto.code);
  }

  @Post('2fa/setup')
  async setup2fa(@CurrentUser() user: any, @Body() dto: TwoFaSetupDto) {
    return this.authService.setup2fa(user.sub, dto.label);
  }

  @Post('profile')
  async profile(@CurrentUser() user: any) {
    return { id: user.sub, email: user.email, twoFaPassed: user.twoFaPassed };
  }
}

