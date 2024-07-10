
import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: ValidRoles[]) { //ValidRoles : solo los roles que estan aqui 
    // lo que hicimos solo fue mover las dos decoradores aqui adentro de applyDecorators - 
    return applyDecorators(
        RoleProtected(...roles),//aceptara solo los valores que tiene roles //quitar el @
        UseGuards(AuthGuard(), UserRoleGuard), //Recordar que AuthGuard() es de Passport 
    );
}
