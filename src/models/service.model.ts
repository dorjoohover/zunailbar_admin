interface Discounted {
  discountedAmount: number;
  discount: number;
  discountValue: string;
  discountType: number;
}

export interface IService {
  id: string;
  branch_id: string;
  name: string;
  max_price: number;
  min_price: number;
  duration: number;
  min: Discounted;
  max?: Discounted;
}
