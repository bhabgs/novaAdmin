import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './config.entity';

@Injectable()
export class ConfigsService {
  constructor(@InjectRepository(Config) private configsRepository: Repository<Config>) {}

  async findAll() {
    return this.configsRepository.find();
  }

  async findByKey(key: string) {
    return this.configsRepository.findOne({ where: { key } });
  }

  async set(key: string, value: string, type?: string, description?: string) {
    let config = await this.configsRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
      if (type) config.type = type;
      if (description) config.description = description;
    } else {
      config = this.configsRepository.create({ key, value, type, description });
    }
    return this.configsRepository.save(config);
  }

  async remove(key: string) {
    await this.configsRepository.delete({ key });
  }
}
