import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces'; //permitira ingresar solo arreglo de estos

export const META_ROLES = 'roles'


// hizo lo mismo de la Metadata - pero usamos {}
// es una funcion que recibe un arreglo de strings
export const RoleProtected = (...args: ValidRoles[]) => {

    
    return SetMetadata(META_ROLES, args);
}
