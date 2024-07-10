import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    // me ayuda a tener informacio nde los decoradores 
    private readonly reflector : Reflector  //para traernos el SetMetadata de authController
  ){}

  // Para que un guard sea valido debe usar el canActivate y regresa un valor booleano
  canActivate(
    context: ExecutionContext, 
    // si el valor booleano es true lo deja pasar , false no lo deja pasar , 
    // una promesa que regresa un booleano , true o false
    // un Observable que emita un valor booleano , true o false
  ): boolean | Promise<boolean> | Observable<boolean> {
    // para tener los roles me pide estos dos parametros 
    const validRoles : string[] = this.reflector.get(META_ROLES, context.getHandler())

    if(!validRoles) return true; //si no existen cualquiera puede entrar  
    if(validRoles.length === 0) return true;  //si viene vacio igual le dejaremos pasar

    // Tenemos el Request : 
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    // console.log({validRoles}); //{ validRoles: [ 'admin', 'super-user' ] }

    // buscamos si existe el usuario
    if(!user)
      throw new BadRequestException('User not found')
    
    for (const  role of user.roles) {
      if(validRoles.includes( role )){ //si los roles que envio es igual a uno de los roles que estan en el usuario
        return true//si es false en el json dara 404
      }
    }
    throw new ForbiddenException(
      `user ${user.fullName} need a valid role : [${validRoles}]`
    );
  }

}
