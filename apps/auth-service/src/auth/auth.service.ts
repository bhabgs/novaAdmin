import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ip: string) {
    const { username, password } = loginDto;
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('User is disabled');
    }

    await this.usersService.updateLastLogin(user.id, ip);

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
