export interface NicepayConfirmResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  orderId: string;
  status: string; // 'paid', 'ready' 등
  paidAt: string | null;
  payMethod: string;
  amount: number;
  goodsName: string;
  buyerName: string;
  buyerTel: string;
}

// NicePay 콜백 DTO (returnUrl로 받는 데이터)
export interface NicepayCallbackDto {
  resultCode: string;
  resultMsg: string;
  tid: string;
  clientId: string;
  orderId: string;
  amount: string; // string으로 옴
  mallReserved: string;
}
