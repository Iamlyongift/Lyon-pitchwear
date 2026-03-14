export interface IOrderEmailPayload {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
}

export interface IWelcomeEmailPayload {
  name: string;
  email: string;
}

export interface IPasswordResetEmailPayload {
  name: string;
  email: string;
  resetLink: string;
}
