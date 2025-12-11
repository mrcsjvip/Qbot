import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class TwoFaVerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;
}

export class TwoFaSetupDto {
  @IsOptional()
  @IsString()
  label?: string;
}

