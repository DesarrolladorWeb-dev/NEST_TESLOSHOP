import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

// Creando un decorador
//pide como argumento una funcion
export const GetUser = createParamDecorator(
    (data, ctx:ExecutionContext)=> { //se ejecutara este callback al llamarlo

        // ctx:es como se encuentra nest en este momento en la ejecucion - y tenemos acceso a la Request
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if(!user)
            throw new InternalServerErrorException('User not founf (request)'); //500 es error mio de backend
        
        return (!data) 
            ? user  
            : user[data];   //si existe la data - solo retornara la data
    }
);