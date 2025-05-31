import { Controller, Post, Req, Request, Response, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController 
{
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Response() res, @Request() req) 
    {
        if (!req.user)
        {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            })
        }

        const user = await this.authService.login(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data: user
        })
    }
}
