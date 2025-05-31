import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) {}

    async validateUser(email: string, pass: string) 
    {
        const user = await this.userService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) 
        {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) 
    {
        const payload = { sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
