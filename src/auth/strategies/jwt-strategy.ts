import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,

        configService : ConfigService //debe estar importardo en  authmodule
    ){
        super({ //llamar al contructor del padre
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    // Metodo de validacion del payload
    // este metodo se llamara si el jwt no ha expirado y si la firma del jwt hace match con el payload
    async validate(payload : JwtPayload) : Promise<User> { //va a regresar una promesa con la instancia de User de bd
        
        const {id} = payload ;

        const user = await this.userRepository.findOneBy({id});
        if(!user)
            throw new UnauthorizedException('Token not valid')
        if(!user.isActive)
            throw new UnauthorizedException('User is inactive, talk with an admin');

        // console.log({user}) 
        
        return user ;
    }

}