import { Metadata } from 'next';
import { OrderConfirmationView } from '@/components/checkout/OrderConfirmationView';

export const metadata: Metadata = {
  title: 'Order Confirmed | Shopbujo Hatto',
  description: 'Order confirmation state for Shopbujo Hatto.',
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationView />;
}
