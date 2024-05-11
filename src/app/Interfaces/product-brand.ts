export interface ProductBrand {
  id: number;
  name: string;
  image: string;
  description: string;
  name_Ar: string;
  price: number;
  description_Ar: string;
  brandId: number;
}


export interface CountRate {
  [key: number]: number;
}

const countRate: CountRate = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0
};

