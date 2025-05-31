import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Response } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FindTasksQueryDto } from './dto/FindTasksQueryDto.dto';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/enum/role.enum';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get()
    @UseGuards(JwtAuthGuard) // AuthGuard
    async findAll(@Response() res, @Query() query: FindTasksQueryDto) 
    {
        const tasks = await this.taskService.findAll(query);

        if (tasks.data.length === 0)
        {
            return res.status(404).json({
                success: false,
                message: "No Task Was Found!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Tasks Retrieved Successfully",
            data: tasks.data,
            total: tasks.total
        })
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('/admin-tasks')
    async getAllTasksForAdmin(@Response() res) 
    {
        const tasks = await this.taskService.findAllAdmin();

        if (tasks.length === 0)
        {
            return res.status(404).json({
                success: false,
                message: "No Admin Task Was Found!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Admin Tasks Retrieved Successfully",
            data: tasks
        })
    }

    @Get(':id/logs')
    @UseGuards(JwtAuthGuard)
    async getTaskLogs(@Response() res, @Param('id') id: string) 
    {
        const taskExists = await this.taskService.findOne(id);

        if (!taskExists || taskExists === null || taskExists === undefined)
        {
            return res.status(404).json({
                success: false,
                message: "Task Logs Not Found!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Task Logs Retrieved Successfully",
            data: taskExists.logs
        })
    }

    @Get(':id')
    async getOne(@Response() res, @Param('id') id: string) 
    {
        const taskExists = await this.taskService.findOne(id);
        
        if (!taskExists || taskExists === null || taskExists === undefined)
        {
            return res.status(404).json({
                success: false,
                message: "Task Logs Not Found!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Tasks Retrieved Successfully",
            data: taskExists
        })
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Response() res, @Body() dto: CreateTaskDto) 
    {
        const saveTask = await this.taskService.create(dto);

        if (!saveTask)
        {
            return res.status(400).json({
                success: false,
                message: "Oooops! Something Went Wrong. Task Creation Failed!"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Task Created Successfully",
            data: saveTask
        })
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Response() res, @Param('id') id: string, @Body() dto: UpdateTaskDto) 
    {
        try 
        {
            const taskExists = await this.taskService.findOne(id);
            
            if (!taskExists || taskExists === null || taskExists === undefined)
            {
                return res.status(404).json({
                    success: false,
                    message: "Task Not Found!"
                })
            }

            const updatedTask = await this.taskService.update(id, dto);

            if (!updatedTask)
            {
                return res.status(400).json({
                    success: false,
                    message: "Task Not Updated!"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Task Updated Successfully",
                data: dto
            })
        } 
        catch (error) 
        {
            return res.status(400).json({
                success: false,
                message: "Oooops! Something Went Wrong. Task Not Updated!",
                error: error.message
            })
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Response() res, @Param('id') id: string) 
    {
        try 
        {
            const taskExists = await this.taskService.findOne(id);

            if (!taskExists || taskExists === null || taskExists === undefined)
            {
                return res.status(404).json({
                    success: false,
                    message: "Task Not Found!"
                })
            }

            await this.taskService.remove(id);
            
            return res.status(200).json({
                success: true,
                message: "Task Was Deleted Successfully"
            })
        } 
        catch (error) 
        {
            return res.status(400).json({
                success: false,
                message: "Oooops! Something Went Wrong. Task Not Deleted!",
                error: error.message
            })
        }
    }
}
