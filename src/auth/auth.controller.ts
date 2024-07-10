import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { RoleProtected } from './decorators/role-protected.decorator';
import { AuthService } from './auth.service';
import { Auth, GetUser,RawHeaders } from './decorators';

import { CreateUserDto , LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards( AuthGuard() ) //todo automatico para la seguridad - que este el token y Activo usuario (usa jwt-strategy.ts)
  testingPrivateRoute(
    @Req() request: Express.Request, //tomare la request completamente
    @GetUser() user : User,//tendra una salida de tipo User
    @GetUser('email') userEmail:string, //me interesa el email del usuario
    @RawHeaders() rawHeaders : string[], //T raernos el beader Token
    @Headers() headers: IncomingHttpHeaders,
  ){
    // console.log({user : request.user})
    console.log(request);


    return {
      ok: true,
      message: "Hola mundo private",
      user,
      userEmail,
      rawHeaders,
      headers,
    }
  }
  // @SetMetadata('roles',['admin','super-user']) //para añadir informacion extra a lo que quiero controlar - roles que necesito para ejecutar este privateRoute2

  @Get('private2')
  @RoleProtected(ValidRoles.superUser,ValidRoles.admin, ValidRoles.user) //solo los que quiero de tipo de usuario 
  @UseGuards(AuthGuard(), UserRoleGuard) //UserRoleGuard - hace la verificacion de lo anterior SetMetadata
  privateRoute2(
    @GetUser()user:User
  ) {
    return {
      ok : true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(
    @GetUser()user:User
  ) {
    return {
      ok : true,
      user
    }
  }

}
