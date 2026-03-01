import instance from "./instance";

export interface IOrderItem {
  name: string;
  qty: number;
  amount: number;
}

export type OrderStatusType =
  | "pending"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatusType = "paid" | "unpaid" | "refunded";

export interface IOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_notes: string;
  items: IOrderItem[];
  total_amount: number;
  order_status: OrderStatusType;
  payment_status: PaymentStatusType;
  created_at: string;
  updated_at: string;
}

export interface IOrdersResponse {
  items: IOrder[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const getOrders = async (
  page = 1,
  pageSize = 10,
): Promise<IOrdersResponse> => {
  const response = await instance.get("/orders/", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};
