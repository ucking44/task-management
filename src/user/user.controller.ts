import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Response, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/decorators/roles.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async create(@Response() res, @Body() createUserDto: CreateUserDto) 
    {
        const emailExists = await this.userService.emailExists(createUserDto.email);

        if (emailExists) 
        {
            return res.status(400).json({
                success: false,
                message: 'User With This Email Already Exists',
            });
        }

        if (!createUserDto.email || !createUserDto.password) 
        {
            return res.status(400).json({
                success: false,
                message: 'Email And Password Are Required',
            });
        }

        try 
        {
            const savedUser = await this.userService.create(createUserDto);
            return res.status(201).json({
                success: true,
                message: 'User Created Successfully',
                data: savedUser,
            });
        } 
        catch (error) 
        {
            return res.status(500).json({
                success: false,
                message: 'Oops! Something went wrong.',
                error: error.message,
            });
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async findAll(@Response() res) 
    {
        const allUsers = await this.userService.findAll();

        if (allUsers.length === 0)
        {
            return res.status(404).json({
                success: false,
                message: "No User Was Found!"
            })
        }
        
        return res.status(200).json({
            success: true,
            message: "Users Retieved Successfully",
            data: allUsers
        })
    }

    @Get(':id')
    async findSingleUser(@Response() res, @Param('id') id: string) 
    {
        const user = await this.userService.findOne(id);

        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: "User Not Found!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User Retrieved Successfully",
            data: user
        })
    }

    @Patch(':id')
    async update(@Response() res, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) 
    {
        const user = await this.userService.findOne(id);

        if (user.email === updateUserDto.email)
        {
            return res.status(400).json({
                success: false,
                message: "You Cannot Update User Email To The Same Email"
            })
        }

        if (!user || user === null || user === undefined)
        {
            return res.status(404).json({
                success: false,
                message: "User Not Found!"
            })
        }

        const updatedUser = await this.userService.update(id, updateUserDto);

        if (!updatedUser)
        {
            return res.status(400).json({
                success: false,
                message: "Oooops! Something Went Wrong. User Not Updated!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User Updated Successfully",
            data: updateUserDto
        })
    }
}
