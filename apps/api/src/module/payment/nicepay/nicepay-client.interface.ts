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
