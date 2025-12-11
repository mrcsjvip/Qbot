import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { SupabaseRepo } from '../infra/supabase-repo';
import { LoginDto, RegisterDto } from './dto/auth.dto';

type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  two_fa_secret?: string | null;
};

@Injectable()
export class AuthService {
  private users = new SupabaseRepo('users');
  private mockUsers: UserRecord[] = [
    {
      id: 'mock-user-1',
      email: 'demo@qbot.io',
      password_hash: '',
      two_fa_secret: null,
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // Supabase unavailable fallback
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const exists = this.mockUsers.find((u) => u.email === dto.email);
      if (exists) throw new UnauthorizedException('User exists');
      const hash = await bcrypt.hash(dto.password, 10);
      const user = { id: `mock-${Date.now()}`, email: dto.email, password_hash: hash };
      this.mockUsers.push(user as UserRecord);
      return { id: user.id, email: user.email };
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.insert({
      email: dto.email,
      password_hash: hash,
    });
    return { id: user.id, email: user.email };
  }

  async validateUser(dto: LoginDto) {
    let user: UserRecord | undefined;

    const useMock = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (useMock) {
      user = this.mockUsers.find((u) => u.email === dto.email);
    } else {
      const rows = await this.users.query({ email: dto.email });
      user = rows?.[0] as UserRecord | undefined;
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // if mock user has no hash yet, set it lazily (for demo)
    if (!user.password_hash) {
      user.password_hash = await bcrypt.hash('demo123', 10);
    }

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: UserRecord, twoFaPassed = false) {
    // if user has 2fa, require passed
    if (user.two_fa_secret && !twoFaPassed) {
      return { requires2fa: true };
    }
    const payload = { sub: user.id, email: user.email, twoFaPassed: true };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async setup2fa(userId: string, label?: string) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new UnauthorizedException('2FA not supported in mock mode');
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      label ?? `qbot:${userId}`,
      'qbot',
      secret,
    );
    await this.users.update(userId, { two_fa_secret: secret });
    return { secret, otpauth };
  }

  async verify2fa(email: string, code: string) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new UnauthorizedException('2FA not supported in mock mode');
    }

    const rows = await this.users.query({ email });
    const user = rows?.[0] as UserRecord | undefined;
    if (!user || !user.two_fa_secret)
      throw new UnauthorizedException('2FA not enabled or user missing');
    const valid = authenticator.verify({ token: code, secret: user.two_fa_secret });
    if (!valid) throw new UnauthorizedException('Invalid 2FA code');
    return this.login(user, true);
  }
}

