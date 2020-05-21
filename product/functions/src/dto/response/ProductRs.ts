export class ProductRs {
  id?: string;
  marketId?: string;
  name?: string;
  description?: string;
  images?: ProductImageRs[];
  price?: PriceRs;
}

export class ProductImageRs {
  id?: string;
  name?: string;
  url?: string;
}

export class PriceRs {
  priceUnit?: number;
}