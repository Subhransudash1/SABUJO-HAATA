import { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout Preview | Shopbujo Hatto',
  description:
    'Frontend checkout preview for Shopbujo Hatto. Live order placement activates after backend database connection.',
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
