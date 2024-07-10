import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

// import { ValidRoles } from '../auth/interfaces';
// import { Auth } from '../auth/decorators';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  executeSeed(){
    return this.seedService.runSeed()
  }
}
