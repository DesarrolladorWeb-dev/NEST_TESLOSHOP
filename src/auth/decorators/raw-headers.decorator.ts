
import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

// Creando un decorador
//pide como argumento una funcion
export const RawHeaders = createParamDecorator(
    (data, ctx:ExecutionContext)=> { //se ejecutara este callback al llamarlo

        // ctx:es como se encuentra nest en este momento en la ejecucion - y tenemos acceso a la Request
        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;

       
    }
);