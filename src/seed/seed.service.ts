import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed.data';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async executeSedd() {
    await this.deleteTables();
    const firstUser: User = await this.insertNewUser();
    await this.insertNewProduct(firstUser);
    return `Seed execute`;
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUser() {
    const seedUser = initialData.users;
    const users: User[] = [];
    seedUser.forEach((user) => {
      const { password, ...userData } = user;
      users.push(
        this.userRepository.create({
          ...userData,
          password: bcrypt.hashSync(password, 10),
        }),
      );
    });

    const dbUser = await this.userRepository.save(users);
    return dbUser[0];
  }

  private async insertNewProduct(user: User) {
    await this.productsService.deleteAllProducts();

    var insertPromises = [];
    initialData.products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
