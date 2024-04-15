import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('ProductsService');

  constructor(private readonly productsService: ProductsService) {}

  async executeSedd() {
    await this.insertNewProduct();
    return `Seed execute`;
  }

  private async insertNewProduct() {
    await this.productsService.deleteAllProducts();

    var insertPromises = [];
    initialData.products.forEach((pro) => {
      insertPromises.push(this.productsService.create(pro));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
