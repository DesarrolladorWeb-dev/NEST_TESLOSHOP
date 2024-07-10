import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import  * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';
import { LoginUserDto , CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor (
    @InjectRepository(User) 
    private readonly userRepository : Repository<User>,
    // JwtService: fecha de expiracion , tiempo dura, llave para firmar 
    private readonly jwtService : JwtService //este servicio es proporcionado por el JwtModule que esta en  los import de auth-module

  ){

  }

  async create(createUserDto: CreateUserDto) {
    
    try {

      const {password , ...userData} = createUserDto;


      // el primer parametro es el objeto que luzca(esto no es la insersion es para prepararlo para la insercion)
      const user = this.userRepository.create({
        ...userData,
        password : bcrypt.hashSync(password,10)
      });

      await this.userRepository.save(user)
      delete user.password; //para que no aparesca en la respuesta del json

      return {
        ...user,
        token : this.getJwtToken({id: user.id}) //tiene que ingresar un objet por la interface 
      };

      // TODO : retornar el jwt de acces
    } catch (error) {
      this.handlerDBErrors(error)
    }

  }

  async login( loginUserDto: LoginUserDto){
    const {password , email} = loginUserDto

    const user = await this.userRepository.findOne({
      where : {email},
      select : {email : true , password : true , id : true}  // los campos que solo me interesan 
    })
    
    if(!user) 
      throw new UnauthorizedException('Credentials are not valid (email) ')
    
    if(!bcrypt.compareSync(password , user.password) )
      throw new UnauthorizedException('Credentials are not valid (password) ')

    
    return {
      ...user,
      token : this.getJwtToken({id:user.id}) //tiene que ingresar un objet por la interface 
    }
    // Todo : retornar el jwt

  }

  async checkAuthStatus(user:User){

    return {
      ...user,
      token : this.getJwtToken({id:user.id}) //tiene que ingresar un objet por la interface 
    }

  }

  private getJwtToken(payload: JwtPayload) { //JwtPayload: por el momento solo tiene email
    // creamos el token
    const token = this.jwtService.sign(payload); 
    return token;

  }

  private handlerDBErrors (error: any) : never { //never: no regresa un valor
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

    console.log(error)

    throw new InternalServerErrorException('Please check server logs')
  }


}
