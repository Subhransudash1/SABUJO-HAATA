function dispatchCustomEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
    try { window.dispatchEvent(new Event(name)); } catch {}
  }
}

import { Product } from '@/types/product';
import { PRODUCTS } from '@/data/products';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;   // INR
  lineTotal: number;    // INR
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Could Not Deliver';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  amount: number;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'COD';
  deliveryDate?: string;
  deliveryPersonId?: string;
  customerId: string;
  cancellationReason?: string;
  cancelledAt?: string;
  invoiceFinalized?: boolean;
  invoiceNumber?: string;
  inventoryDeducted?: boolean;
  inventoryRestocked?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  subcategory: string;
  stockQty: number;
  unit: string;
  sellingPrice: number;
  offerPrice?: number;
  costPerUnit: number;
  lastUpdated: string;
  image?: string;
  /** true for products added through the admin panel (not in the static storefront catalogue) */
  custom?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  reference?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  notes: string;
  active: boolean;
  assignedOrders: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid';
  status: 'Draft' | 'Finalized';
  createdAt: string;
  isManual: boolean;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
}

// ─── Storage keys ───────────────────────────────────────────────────────────

const KEYS = {
  orders: 'sabuja_admin_orders',
  customers: 'sabuja_admin_customers',
  inventory: 'sabuja_admin_inventory',
  expenses: 'sabuja_admin_expenses',
  deliveryPartners: 'sabuja_admin_delivery_partners',
  invoices: 'sabuja_admin_invoices',
  customerNotes: 'sabuja_admin_customer_notes',
  adminAuth: 'sabuja_admin_auth',
} as const;

// ─── LocalStorage helpers ───────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota exceeded, etc. */ }
}

// ─── DEMO DATA SEED ─────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const DEMO_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Priya Mohanty', email: 'priya@example.com', phone: '9876543210', address: '12, Sahid Nagar, Bhubaneswar', totalOrders: 5, totalSpent: 2450, lastOrderDate: '2026-10-24', status: 'Active' },
  { id: 'CUST-002', name: 'Rajan Patnaik', email: 'rajan@example.com', phone: '9876543211', address: '45, Jaydev Vihar, Bhubaneswar', totalOrders: 3, totalSpent: 1800, lastOrderDate: '2026-10-23', status: 'Active' },
  { id: 'CUST-003', name: 'Sunita Das', email: 'sunita@example.com', phone: '9876543212', address: '78, Nayapalli, Bhubaneswar', totalOrders: 8, totalSpent: 5200, lastOrderDate: '2026-10-25', status: 'Active' },
  { id: 'CUST-004', name: 'Amit Sahoo', email: 'amit@example.com', phone: '9876543213', address: '23, Rasulgarh, Bhubaneswar', totalOrders: 1, totalSpent: 350, lastOrderDate: '2026-10-10', status: 'Active' },
  { id: 'CUST-005', name: 'Mamata Behera', email: 'mamata@example.com', phone: '9876543214', address: '56, Khandagiri, Bhubaneswar', totalOrders: 0, totalSpent: 0, lastOrderDate: '', status: 'Inactive' },
  // 4 Realistic Demo Pending Order Customers
  { id: 'CUST-DEMO-01', name: 'Debashis Mohanty', email: 'debashis.mohanty@example.com', phone: '9861122334', address: 'Plot 204, Saheed Nagar, Bhubaneswar - 751007', totalOrders: 1, totalSpent: 150, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-DEMO-02', name: 'Swati Smita Nayak', email: 'swati.nayak@example.com', phone: '9437133445', address: 'Flat 301, Nilakantha Enclave, Jaydev Vihar, Bhubaneswar - 751013', totalOrders: 1, totalSpent: 170, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-DEMO-03', name: 'Alok Kumar Jena', email: 'alok.jena@example.com', phone: '9853144556', address: 'House 45, Kalinga Nagar, Ghatikia, Bhubaneswar - 751003', totalOrders: 1, totalSpent: 166, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-DEMO-04', name: 'Tanmayee Praharaj', email: 'tanmayee.p@example.com', phone: '9937155667', address: 'Plot 118, Master Canteen Square, Unit 3, Bhubaneswar - 751001', totalOrders: 1, totalSpent: 206, lastOrderDate: '2026-10-26', status: 'Active' },
  // 10 Pending Order Customers
  { id: 'CUST-006', name: 'Soumya Ranjan Dash', email: 'soumya.dash@example.com', phone: '9861012345', address: 'Flat 402, Royal Residency, Patia, Bhubaneswar - 751024', totalOrders: 1, totalSpent: 171, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-007', name: 'Ananya Mishra', email: 'ananya.mishra@example.com', phone: '9437023456', address: 'Plot 112, Forest Park, Bhubaneswar - 751009', totalOrders: 1, totalSpent: 170, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-008', name: 'Debabrata Mohapatra', email: 'debabrata.m@example.com', phone: '9853034567', address: 'House 24, Jaydev Vihar, Bhubaneswar - 751013', totalOrders: 1, totalSpent: 200, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-009', name: 'Lipika Priyadarshini', email: 'lipika.p@example.com', phone: '9776045678', address: 'Qtrs 3R/12, Unit 4, Bhauma Nagar, Bhubaneswar - 751001', totalOrders: 1, totalSpent: 150, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-010', name: 'Rajesh Kumar Swain', email: 'rajesh.swain@example.com', phone: '9937056789', address: '58/B, Saheed Nagar, Bhubaneswar - 751007', totalOrders: 1, totalSpent: 190, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-011', name: 'Subhashree Senapati', email: 'subhashree.s@example.com', phone: '9861067890', address: 'HIG-45, Phase 2, Chandrasekharpur, Bhubaneswar - 751016', totalOrders: 1, totalSpent: 184, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-012', name: 'Bikash Chandra Rout', email: 'bikash.rout@example.com', phone: '9438078901', address: 'Plot 340, Pokhariput, Bhubaneswar - 751020', totalOrders: 1, totalSpent: 157.5, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-013', name: 'Manaswini Tripathy', email: 'manaswini.t@example.com', phone: '9777089012', address: '12A, Madhusudan Nagar, Unit 9, Bhubaneswar - 751022', totalOrders: 1, totalSpent: 190, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-014', name: 'Jyoti Prakash Nayak', email: 'jyoti.nayak@example.com', phone: '9938090123', address: 'Flat 201, Green Garden Apts, Khandagiri, Bhubaneswar - 751030', totalOrders: 1, totalSpent: 160, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-015', name: 'Sasmita Pradhan', email: 'sasmita.p@example.com', phone: '9853101234', address: 'Lane 6, Jagamara, Bhubaneswar - 751030', totalOrders: 1, totalSpent: 180, lastOrderDate: '2026-10-26', status: 'Active' },
  // 5 Delivery Queue Order Customers
  { id: 'CUST-016', name: 'Pritam Kanungo', email: 'pritam.k@example.com', phone: '9861211111', address: 'House 77, DLF Cybercity Road, Patia, Bhubaneswar - 751024', totalOrders: 1, totalSpent: 181, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-017', name: 'Snigdha Barik', email: 'snigdha.b@example.com', phone: '9437222222', address: 'Plot 512, Niladri Vihar, Bhubaneswar - 751021', totalOrders: 1, totalSpent: 185, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-018', name: 'Tapan Kumar Das', email: 'tapan.das@example.com', phone: '9853333333', address: '14/C, Sahid Nagar, Bhubaneswar - 751007', totalOrders: 1, totalSpent: 180, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-019', name: 'Priyanka Hota', email: 'priyanka.h@example.com', phone: '9776444444', address: 'Flat 104, Utkal Heights, Pahala, Bhubaneswar - 752101', totalOrders: 1, totalSpent: 192.5, lastOrderDate: '2026-10-26', status: 'Active' },
  { id: 'CUST-020', name: 'Ashok Kumar Panigrahi', email: 'ashok.p@example.com', phone: '9937555555', address: 'Plot 88, Kalinga Nagar, Ghatikia, Bhubaneswar - 751003', totalOrders: 1, totalSpent: 185, lastOrderDate: '2026-10-26', status: 'Active' },
];

export const FOUR_PENDING_DEMO_ORDERS: Order[] = [
  {
    id: 'DEMO-ORD-101',
    date: '2026-10-26T10:15:00.000Z',
    status: 'Pending',
    amount: 150,
    items: [
      { productId: 'veg-01', productName: 'Potato', quantity: 3, unit: 'kg', unitPrice: 15, lineTotal: 45 },
      { productId: 'veg-03', productName: 'Ginger', quantity: 0.5, unit: 'kg', unitPrice: 160, lineTotal: 80 },
    ],
    customerName: 'Debashis Mohanty',
    customerPhone: '9861122334',
    customerEmail: 'debashis.mohanty@example.com',
    address: 'Plot 204, Saheed Nagar, Bhubaneswar - 751007',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    customerId: 'CUST-DEMO-01',
  },
  {
    id: 'DEMO-ORD-102',
    date: '2026-10-26T10:30:00.000Z',
    status: 'Pending',
    amount: 170,
    items: [
      { productId: 'veg-05', productName: 'Sweet Potato', quantity: 2, unit: 'kg', unitPrice: 69, lineTotal: 138 },
      { productId: 'veg-06', productName: 'Radish', quantity: 4, unit: 'piece', unitPrice: 8, lineTotal: 32 },
    ],
    customerName: 'Swati Smita Nayak',
    customerPhone: '9437133445',
    customerEmail: 'swati.nayak@example.com',
    address: 'Flat 301, Nilakantha Enclave, Jaydev Vihar, Bhubaneswar - 751013',
    paymentMethod: 'COD',
    paymentStatus: 'COD',
    customerId: 'CUST-DEMO-02',
  },
  {
    id: 'DEMO-ORD-103',
    date: '2026-10-26T10:45:00.000Z',
    status: 'Pending',
    amount: 166,
    items: [
      { productId: 'veg-07', productName: 'Ridge Gourd', quantity: 2, unit: 'kg', unitPrice: 28, lineTotal: 56 },
      { productId: 'veg-12', productName: 'Brinjal', quantity: 1.5, unit: 'kg', unitPrice: 36, lineTotal: 54 },
      { productId: 'veg-11', productName: 'Pointed Gourd', quantity: 2, unit: 'kg', unitPrice: 28, lineTotal: 56 },
    ],
    customerName: 'Alok Kumar Jena',
    customerPhone: '9853144556',
    customerEmail: 'alok.jena@example.com',
    address: 'House 45, Kalinga Nagar, Ghatikia, Bhubaneswar - 751003',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    customerId: 'CUST-DEMO-03',
  },
  {
    id: 'DEMO-ORD-104',
    date: '2026-10-26T11:00:00.000Z',
    status: 'Pending',
    amount: 206,
    items: [
      { productId: 'fruit-01', productName: 'Apple (Shimla)', quantity: 1, unit: 'kg', unitPrice: 140, lineTotal: 140 },
      { productId: 'veg-10', productName: 'Pumpkin', quantity: 1.5, unit: 'kg', unitPrice: 24, lineTotal: 36 },
      { productId: 'veg-01', productName: 'Potato', quantity: 2, unit: 'kg', unitPrice: 15, lineTotal: 30 },
    ],
    customerName: 'Tanmayee Praharaj',
    customerPhone: '9937155667',
    customerEmail: 'tanmayee.p@example.com',
    address: 'Plot 118, Master Canteen Square, Unit 3, Bhubaneswar - 751001',
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    customerId: 'CUST-DEMO-04',
  },
];

function makeDemoOrders(): Order[] {
  return [
    ...FOUR_PENDING_DEMO_ORDERS,
    // ── Exactly 10 Realistic Demonstration Orders in Pending status ──
    {
      id: 'ORD-1001',
      date: '2026-10-26T08:30:00.000Z',
      status: 'Pending',
      amount: 171,
      items: [
        { productId: 'veg-01', productName: 'Potato', quantity: 2, unit: 'kg', unitPrice: 15, lineTotal: 30 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 1.5, unit: 'kg', unitPrice: 40, lineTotal: 60 },
        { productId: 'veg-05', productName: 'Onion', quantity: 2, unit: 'kg', unitPrice: 28, lineTotal: 56 },
      ],
      customerName: 'Soumya Ranjan Dash',
      customerPhone: '9861012345',
      customerEmail: 'soumya.dash@example.com',
      address: 'Flat 402, Royal Residency, Patia, Bhubaneswar - 751024',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-006',
    },
    {
      id: 'ORD-1002',
      date: '2026-10-26T08:45:00.000Z',
      status: 'Pending',
      amount: 170,
      items: [
        { productId: 'veg-16', productName: 'Pointed Gourd (Potala)', quantity: 1, unit: 'kg', unitPrice: 45, lineTotal: 45 },
        { productId: 'veg-14', productName: 'Ridge Gourd (Janhi)', quantity: 1, unit: 'kg', unitPrice: 35, lineTotal: 35 },
        { productId: 'veg-26', productName: 'Coriander Leaves (Dhania Patra)', quantity: 2, unit: 'bundle', unitPrice: 10, lineTotal: 20 },
        { productId: 'veg-09', productName: 'Brinjal (Baigana)', quantity: 1.5, unit: 'kg', unitPrice: 30, lineTotal: 45 },
      ],
      customerName: 'Ananya Mishra',
      customerPhone: '9437023456',
      customerEmail: 'ananya.mishra@example.com',
      address: 'Plot 112, Forest Park, Bhubaneswar - 751009',
      paymentMethod: 'COD',
      paymentStatus: 'COD',
      customerId: 'CUST-007',
    },
    {
      id: 'ORD-1003',
      date: '2026-10-26T09:00:00.000Z',
      status: 'Pending',
      amount: 200,
      items: [
        { productId: 'veg-10', productName: 'Cauliflower', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-17', productName: 'Green Peas (Matar)', quantity: 1, unit: 'kg', unitPrice: 60, lineTotal: 60 },
        { productId: 'veg-03', productName: 'Ginger (Ada)', quantity: 0.5, unit: 'kg', unitPrice: 120, lineTotal: 60 },
      ],
      customerName: 'Debabrata Mohapatra',
      customerPhone: '9853034567',
      customerEmail: 'debabrata.m@example.com',
      address: 'House 24, Jaydev Vihar, Bhubaneswar - 751013',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-008',
    },
    {
      id: 'ORD-1004',
      date: '2026-10-26T09:15:00.000Z',
      status: 'Pending',
      amount: 150,
      items: [
        { productId: 'veg-21', productName: 'Spinach (Palanga Saga)', quantity: 3, unit: 'bundle', unitPrice: 15, lineTotal: 45 },
        { productId: 'veg-02', productName: 'Small Potato (Desi Aloo)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
        { productId: 'veg-12', productName: 'Lady Finger (Bhendi)', quantity: 1, unit: 'kg', unitPrice: 35, lineTotal: 35 },
        { productId: 'veg-06', productName: 'Green Chilli', quantity: 0.5, unit: 'kg', unitPrice: 40, lineTotal: 20 },
      ],
      customerName: 'Lipika Priyadarshini',
      customerPhone: '9776045678',
      customerEmail: 'lipika.p@example.com',
      address: 'Qtrs 3R/12, Unit 4, Bhauma Nagar, Bhubaneswar - 751001',
      paymentMethod: 'COD',
      paymentStatus: 'Unpaid',
      customerId: 'CUST-009',
    },
    {
      id: 'ORD-1005',
      date: '2026-10-26T09:30:00.000Z',
      status: 'Pending',
      amount: 190,
      items: [
        { productId: 'veg-13', productName: 'Bottle Gourd (Lau)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
        { productId: 'veg-04', productName: 'Carrot (Gajara)', quantity: 1.5, unit: 'kg', unitPrice: 40, lineTotal: 60 },
        { productId: 'veg-18', productName: 'Drumstick (Sajana Chuin)', quantity: 1, unit: 'kg', unitPrice: 80, lineTotal: 80 },
      ],
      customerName: 'Rajesh Kumar Swain',
      customerPhone: '9937056789',
      customerEmail: 'rajesh.swain@example.com',
      address: '58/B, Saheed Nagar, Bhubaneswar - 751007',
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
      customerId: 'CUST-010',
    },
    {
      id: 'ORD-1006',
      date: '2026-10-26T09:45:00.000Z',
      status: 'Pending',
      amount: 184,
      items: [
        { productId: 'veg-20', productName: 'Raw Papaya (Kancha Omrutabhanda)', quantity: 2, unit: 'kg', unitPrice: 30, lineTotal: 60 },
        { productId: 'veg-05', productName: 'Onion', quantity: 3, unit: 'kg', unitPrice: 28, lineTotal: 84 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 1, unit: 'kg', unitPrice: 40, lineTotal: 40 },
      ],
      customerName: 'Subhashree Senapati',
      customerPhone: '9861067890',
      customerEmail: 'subhashree.s@example.com',
      address: 'HIG-45, Phase 2, Chandrasekharpur, Bhubaneswar - 751016',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-011',
    },
    {
      id: 'ORD-1007',
      date: '2026-10-26T10:00:00.000Z',
      status: 'Pending',
      amount: 157.5,
      items: [
        { productId: 'veg-15', productName: 'Pumpkin (Boitalu)', quantity: 2.5, unit: 'kg', unitPrice: 25, lineTotal: 62.5 },
        { productId: 'veg-22', productName: 'Koshala Saga', quantity: 2, unit: 'bundle', unitPrice: 15, lineTotal: 30 },
        { productId: 'veg-11', productName: 'Bitter Gourd (Kalara)', quantity: 1, unit: 'kg', unitPrice: 40, lineTotal: 40 },
      ],
      customerName: 'Bikash Chandra Rout',
      customerPhone: '9438078901',
      customerEmail: 'bikash.rout@example.com',
      address: 'Plot 340, Pokhariput, Bhubaneswar - 751020',
      paymentMethod: 'COD',
      paymentStatus: 'COD',
      customerId: 'CUST-012',
    },
    {
      id: 'ORD-1008',
      date: '2026-10-26T10:15:00.000Z',
      status: 'Pending',
      amount: 190,
      items: [
        { productId: 'veg-08', productName: 'Garlic (Rasuna)', quantity: 0.5, unit: 'kg', unitPrice: 160, lineTotal: 80 },
        { productId: 'veg-01', productName: 'Potato', quantity: 4, unit: 'kg', unitPrice: 15, lineTotal: 60 },
        { productId: 'veg-19', productName: 'Cabbage (Bandha Kobi)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
      ],
      customerName: 'Manaswini Tripathy',
      customerPhone: '9777089012',
      customerEmail: 'manaswini.t@example.com',
      address: '12A, Madhusudan Nagar, Unit 9, Bhubaneswar - 751022',
      paymentMethod: 'Net Banking',
      paymentStatus: 'Paid',
      customerId: 'CUST-013',
    },
    {
      id: 'ORD-1009',
      date: '2026-10-26T10:30:00.000Z',
      status: 'Pending',
      amount: 160,
      items: [
        { productId: 'veg-24', productName: 'Methi Saga', quantity: 2, unit: 'bundle', unitPrice: 20, lineTotal: 40 },
        { productId: 'veg-25', productName: 'French Beans', quantity: 1, unit: 'kg', unitPrice: 50, lineTotal: 50 },
        { productId: 'veg-27', productName: 'Sweet Potato (Kanda Mula)', quantity: 1.5, unit: 'kg', unitPrice: 30, lineTotal: 45 },
      ],
      customerName: 'Jyoti Prakash Nayak',
      customerPhone: '9938090123',
      customerEmail: 'jyoti.nayak@example.com',
      address: 'Flat 201, Green Garden Apts, Khandagiri, Bhubaneswar - 751030',
      paymentMethod: 'COD',
      paymentStatus: 'Unpaid',
      customerId: 'CUST-014',
    },
    {
      id: 'ORD-1010',
      date: '2026-10-26T10:45:00.000Z',
      status: 'Pending',
      amount: 180,
      items: [
        { productId: 'veg-28', productName: 'Raw Banana (Kancha Kadali)', quantity: 2, unit: 'kg', unitPrice: 35, lineTotal: 70 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-26', productName: 'Coriander Leaves (Dhania Patra)', quantity: 1, unit: 'bundle', unitPrice: 10, lineTotal: 10 },
        { productId: 'veg-06', productName: 'Green Chilli', quantity: 0.5, unit: 'kg', unitPrice: 40, lineTotal: 20 },
      ],
      customerName: 'Sasmita Pradhan',
      customerPhone: '9853101234',
      customerEmail: 'sasmita.p@example.com',
      address: 'Lane 6, Jagamara, Bhubaneswar - 751030',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-015',
    },

    // ── Exactly 5 Demonstration Orders under Order Assignment / Delivery Partners ──
    {
      id: 'ORD-2001',
      date: '2026-10-26T07:15:00.000Z',
      status: 'Out for Delivery',
      amount: 181,
      items: [
        { productId: 'veg-01', productName: 'Potato', quantity: 3, unit: 'kg', unitPrice: 15, lineTotal: 45 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-05', productName: 'Onion', quantity: 2, unit: 'kg', unitPrice: 28, lineTotal: 56 },
      ],
      customerName: 'Pritam Kanungo',
      customerPhone: '9861211111',
      customerEmail: 'pritam.k@example.com',
      address: 'House 77, DLF Cybercity Road, Patia, Bhubaneswar - 751024',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      deliveryPersonId: 'DP-001',
      customerId: 'CUST-016',
    },
    {
      id: 'ORD-2002',
      date: '2026-10-26T07:30:00.000Z',
      status: 'Ready',
      amount: 185,
      items: [
        { productId: 'veg-10', productName: 'Cauliflower', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-12', productName: 'Lady Finger (Bhendi)', quantity: 1, unit: 'kg', unitPrice: 35, lineTotal: 35 },
        { productId: 'veg-21', productName: 'Spinach (Palanga Saga)', quantity: 2, unit: 'bundle', unitPrice: 15, lineTotal: 30 },
        { productId: 'veg-04', productName: 'Carrot (Gajara)', quantity: 1, unit: 'kg', unitPrice: 40, lineTotal: 40 },
      ],
      customerName: 'Snigdha Barik',
      customerPhone: '9437222222',
      customerEmail: 'snigdha.b@example.com',
      address: 'Plot 512, Niladri Vihar, Bhubaneswar - 751021',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      deliveryPersonId: 'DP-001',
      customerId: 'CUST-017',
    },
    {
      id: 'ORD-2003',
      date: '2026-10-26T07:45:00.000Z',
      status: 'Out for Delivery',
      amount: 180,
      items: [
        { productId: 'veg-18', productName: 'Drumstick (Sajana Chuin)', quantity: 1.5, unit: 'kg', unitPrice: 80, lineTotal: 120 },
        { productId: 'veg-17', productName: 'Green Peas (Matar)', quantity: 1, unit: 'kg', unitPrice: 60, lineTotal: 60 },
      ],
      customerName: 'Tapan Kumar Das',
      customerPhone: '9853333333',
      customerEmail: 'tapan.das@example.com',
      address: '14/C, Sahid Nagar, Bhubaneswar - 751007',
      paymentMethod: 'COD',
      paymentStatus: 'Unpaid',
      deliveryPersonId: 'DP-002',
      customerId: 'CUST-018',
    },
    {
      id: 'ORD-2004',
      date: '2026-10-26T08:00:00.000Z',
      status: 'Ready',
      amount: 192.5,
      items: [
        { productId: 'veg-16', productName: 'Pointed Gourd (Potala)', quantity: 2, unit: 'kg', unitPrice: 45, lineTotal: 90 },
        { productId: 'veg-14', productName: 'Ridge Gourd (Janhi)', quantity: 1.5, unit: 'kg', unitPrice: 35, lineTotal: 52.5 },
        { productId: 'veg-02', productName: 'Small Potato (Desi Aloo)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
      ],
      customerName: 'Priyanka Hota',
      customerPhone: '9776444444',
      customerEmail: 'priyanka.h@example.com',
      address: 'Flat 104, Utkal Heights, Pahala, Bhubaneswar - 752101',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-019',
    },
    {
      id: 'ORD-2005',
      date: '2026-10-26T08:15:00.000Z',
      status: 'Could Not Deliver',
      amount: 185,
      items: [
        { productId: 'veg-13', productName: 'Bottle Gourd (Lau)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
        { productId: 'veg-15', productName: 'Pumpkin (Boitalu)', quantity: 3, unit: 'kg', unitPrice: 25, lineTotal: 75 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 1.5, unit: 'kg', unitPrice: 40, lineTotal: 60 },
      ],
      customerName: 'Ashok Kumar Panigrahi',
      customerPhone: '9937555555',
      customerEmail: 'ashok.p@example.com',
      address: 'Plot 88, Kalinga Nagar, Ghatikia, Bhubaneswar - 751003',
      paymentMethod: 'COD',
      paymentStatus: 'COD',
      deliveryPersonId: 'DP-002',
      customerId: 'CUST-020',
    },

    // ── Sample Historical Records (Delivered, Cancelled, Confirmed) ──
    {
      id: 'ORD-3001',
      date: '2026-10-24T11:00:00.000Z',
      status: 'Delivered',
      amount: 220,
      items: [
        { productId: 'veg-01', productName: 'Potato', quantity: 4, unit: 'kg', unitPrice: 15, lineTotal: 60 },
        { productId: 'veg-07', productName: 'Tomato', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-10', productName: 'Cauliflower', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
      ],
      customerName: 'Priya Mohanty',
      customerPhone: '9876543210',
      customerEmail: 'priya@example.com',
      address: '12, Sahid Nagar, Bhubaneswar',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-001',
    },
    {
      id: 'ORD-3002',
      date: '2026-10-23T14:30:00.000Z',
      status: 'Delivered',
      amount: 175,
      items: [
        { productId: 'veg-04', productName: 'Carrot (Gajara)', quantity: 2, unit: 'kg', unitPrice: 40, lineTotal: 80 },
        { productId: 'veg-12', productName: 'Lady Finger (Bhendi)', quantity: 1.5, unit: 'kg', unitPrice: 35, lineTotal: 52.5 },
        { productId: 'veg-05', productName: 'Onion', quantity: 1.5, unit: 'kg', unitPrice: 28, lineTotal: 42 },
      ],
      customerName: 'Rajan Patnaik',
      customerPhone: '9876543211',
      customerEmail: 'rajan@example.com',
      address: '45, Jaydev Vihar, Bhubaneswar',
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      customerId: 'CUST-002',
    },
    {
      id: 'ORD-3003',
      date: '2026-10-25T16:00:00.000Z',
      status: 'Cancelled',
      amount: 140,
      items: [
        { productId: 'veg-13', productName: 'Bottle Gourd (Lau)', quantity: 2, unit: 'kg', unitPrice: 25, lineTotal: 50 },
        { productId: 'veg-16', productName: 'Pointed Gourd (Potala)', quantity: 2, unit: 'kg', unitPrice: 45, lineTotal: 90 },
      ],
      customerName: 'Sunita Das',
      customerPhone: '9876543212',
      customerEmail: 'sunita@example.com',
      address: '78, Nayapalli, Bhubaneswar',
      paymentMethod: 'UPI',
      paymentStatus: 'Unpaid',
      cancellationReason: 'Ordered duplicate items by mistake',
      cancelledAt: '2026-10-25T16:15:00.000Z',
      customerId: 'CUST-003',
    },
    {
      id: 'ORD-3004',
      date: '2026-10-26T06:30:00.000Z',
      status: 'Confirmed',
      amount: 165,
      items: [
        { productId: 'veg-01', productName: 'Potato', quantity: 3, unit: 'kg', unitPrice: 15, lineTotal: 45 },
        { productId: 'veg-18', productName: 'Drumstick (Sajana Chuin)', quantity: 1.5, unit: 'kg', unitPrice: 80, lineTotal: 120 },
      ],
      customerName: 'Amit Sahoo',
      customerPhone: '9876543213',
      customerEmail: 'amit@example.com',
      address: '23, Rasulgarh, Bhubaneswar',
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      customerId: 'CUST-004',
    },
  ];
}

function makeDemoInventory(): InventoryItem[] {
  return PRODUCTS.map((p) => ({
    productId: p.id,
    productName: p.nameEn,
    category: p.category,
    subcategory: p.subcategory,
    stockQty: p.available ? Math.floor(Math.random() * 80) + 5 : 0,
    unit: p.unit,
    sellingPrice: p.price,
    costPerUnit: Math.round(p.price * 0.65),
    lastUpdated: new Date().toISOString(),
  }));
}

function makeDemoExpenses(): Expense[] {
  return [
    { id: 'EXP-001', date: '2026-10-20', category: 'Produce Procurement', description: 'Weekly vegetable purchase from Cuttack mandi', amount: 12500, reference: 'INV-M-2001' },
    { id: 'EXP-002', date: '2026-10-21', category: 'Packaging', description: 'Paper bags and biodegradable containers', amount: 1800 },
    { id: 'EXP-003', date: '2026-10-22', category: 'Delivery', description: 'Fuel and delivery vehicle maintenance', amount: 3200 },
    { id: 'EXP-004', date: '2026-10-23', category: 'Wages', description: 'Weekly staff wages', amount: 8000 },
    { id: 'EXP-005', date: '2026-10-24', category: 'Miscellaneous', description: 'Utility bills and misc supplies', amount: 2100 },
  ];
}

function makeDemoDeliveryPartners(): DeliveryPartner[] {
  return [
    {
      id: 'DP-001',
      name: 'Bikram Nayak',
      phone: '9988776601',
      notes: 'Experienced. Covers Patia & Niladri Vihar area.',
      active: true,
      assignedOrders: ['ORD-2001', 'ORD-2002'],
    },
    {
      id: 'DP-002',
      name: 'Sanjay Jena',
      phone: '9988776602',
      notes: 'Part-time. Available evenings. Covers Sahid Nagar & Ghatikia.',
      active: true,
      assignedOrders: ['ORD-2003', 'ORD-2005'],
    },
    {
      id: 'DP-003',
      name: 'Manas Ranjan Sahu',
      phone: '9988776603',
      notes: 'Available for morning delivery slots (Jaydev Vihar & Nayapalli).',
      active: true,
      assignedOrders: [],
    },
  ];
}

// ─── Initialization ─────────────────────────────────────────────────────────

export function ensureDemoData(): void {
  if (typeof window === 'undefined') return;

  const demoOrders = makeDemoOrders();
  const rawOrders = localStorage.getItem(KEYS.orders);

  if (!rawOrders) {
    write(KEYS.orders, demoOrders);
  } else {
    try {
      const existing: Order[] = JSON.parse(rawOrders);
      const existingIds = new Set(existing.map((o) => o.id));
      let modified = false;

      // Seed the four realistic demo pending orders at top if not already present
      for (const d of FOUR_PENDING_DEMO_ORDERS) {
        if (!existingIds.has(d.id)) {
          existing.unshift(d);
          existingIds.add(d.id);
          modified = true;
        }
      }

      // Seed missing demonstration orders safely without duplicating or mutating genuine customer orders
      for (const d of demoOrders) {
        if (!existingIds.has(d.id)) {
          existing.push(d);
          existingIds.add(d.id);
          modified = true;
        }
      }

      if (modified) {
        write(KEYS.orders, existing);
      }
    } catch {
      write(KEYS.orders, demoOrders);
    }
  }

  // Delivery partners
  const rawPartners = localStorage.getItem(KEYS.deliveryPartners);
  const demoPartners = makeDemoDeliveryPartners();
  if (!rawPartners) {
    write(KEYS.deliveryPartners, demoPartners);
  } else {
    try {
      const existingPartners: DeliveryPartner[] = JSON.parse(rawPartners);
      const existingPIds = new Set(existingPartners.map((p) => p.id));
      let modified = false;
      for (const dp of demoPartners) {
        if (!existingPIds.has(dp.id)) {
          existingPartners.push(dp);
          existingPIds.add(dp.id);
          modified = true;
        } else {
          const current = existingPartners.find((p) => p.id === dp.id);
          if (current) {
            for (const ao of dp.assignedOrders) {
              if (!current.assignedOrders.includes(ao)) {
                current.assignedOrders.push(ao);
                modified = true;
              }
            }
          }
        }
      }
      if (modified) {
        write(KEYS.deliveryPartners, existingPartners);
      }
    } catch {
      write(KEYS.deliveryPartners, demoPartners);
    }
  }

  // Customers
  const rawCust = localStorage.getItem(KEYS.customers);
  if (!rawCust) {
    write(KEYS.customers, DEMO_CUSTOMERS);
  } else {
    try {
      const existingCust: Customer[] = JSON.parse(rawCust);
      const existingCIds = new Set(existingCust.map((c) => c.id));
      let modified = false;
      for (const c of DEMO_CUSTOMERS) {
        if (!existingCIds.has(c.id)) {
          existingCust.push(c);
          existingCIds.add(c.id);
          modified = true;
        }
      }
      if (modified) {
        write(KEYS.customers, existingCust);
      }
    } catch {
      write(KEYS.customers, DEMO_CUSTOMERS);
    }
  }

  if (!localStorage.getItem(KEYS.inventory)) write(KEYS.inventory, makeDemoInventory());
  if (!localStorage.getItem(KEYS.expenses)) write(KEYS.expenses, makeDemoExpenses());
  if (!localStorage.getItem(KEYS.invoices)) write(KEYS.invoices, []);
  if (!localStorage.getItem(KEYS.customerNotes)) write(KEYS.customerNotes, []);
}

// ─── Auth ───────────────────────────────────────────────────────────────────

const ADMIN_ID = '12345';
const ADMIN_PASS = '12345';

export function adminLogin(id: string, password: string): boolean {
  if (id === ADMIN_ID && password === ADMIN_PASS) {
    write(KEYS.adminAuth, { loggedIn: true, ts: Date.now() });
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  const auth = read<{ loggedIn?: boolean }>(KEYS.adminAuth, {});
  return auth.loggedIn === true;
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.adminAuth);
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export function getOrders(): Order[] { return read<Order[]>(KEYS.orders, []); }

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function updateOrderStatus(id: string, status: OrderStatus): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  orders[idx].status = status;
  write(KEYS.orders, orders);
  syncToCustomerOrders(orders[idx]);
  // A cancelled order must not stay on a delivery partner's workload.
  if (status === 'Cancelled' && orders[idx].deliveryPersonId) unassignDeliveryPerson(id);
  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_orders_updated');
  }
  return true;
}

/**
 * Returns allowed next statuses according to the admin workflow.
 * Pending -> Confirmed (via preview page only)
 * Confirmed -> Ready to Ship
 * Ready to Ship -> Out for Delivery, Cancelled
 * Out for Delivery -> Delivered, Could Not Deliver, Cancelled
 * Delivered / Cancelled / Could Not Deliver -> locked from ordinary dropdown transitions.
 */
export function getPermittedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case 'Pending':
      return ['Confirmed'];
    case 'Confirmed':
      return ['Ready'];
    case 'Ready':
      return ['Out for Delivery', 'Cancelled'];
    case 'Out for Delivery':
      return ['Delivered', 'Could Not Deliver', 'Cancelled'];
    case 'Delivered':
    case 'Cancelled':
    case 'Could Not Deliver':
    default:
      return [];
  }
}

/**
 * Synchronizes an order state to the customer's order history storage.
 */
export function syncToCustomerOrders(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('sabuja_user_orders');
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((o) => o.id === order.id);
    const dateFormatted = order.date
      ? new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently';
    const statusLabel =
      order.status === 'Confirmed'
        ? 'Confirmed / Processing'
        : order.status === 'Ready'
        ? 'Ready to Ship'
        : order.status === 'Could Not Deliver'
        ? 'Could Not Be Delivered'
        : order.status;

    const record = {
      id: order.id,
      date: dateFormatted,
      status: statusLabel,
      amount: `₹${order.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      totalPaise: Math.round(order.amount * 100),
      items: order.items.length,
      deliveryDate: order.deliveryDate || 'Standard Delivery',
      address: order.address,
      paymentMethod: order.paymentMethod,
      cancellationReason: order.cancellationReason,
      cancelledAt: order.cancelledAt,
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    localStorage.setItem('sabuja_user_orders', JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Creates an order initiated from the customer storefront and writes to admin orders.
 */
export function createStoreOrder(data: {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: string;
  deliveryDate?: string;
  amount: number;
}): Order {
  const orders = getOrders();
  const newOrder: Order = {
    id: data.id,
    date: new Date().toISOString(),
    status: 'Pending',
    amount: data.amount,
    items: data.items,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    address: data.address,
    paymentMethod: data.paymentMethod,
    paymentStatus: 'Unpaid',
    deliveryDate: data.deliveryDate,
    customerId: `CUST-${data.customerPhone ? data.customerPhone.slice(-4) : 'WEB'}`,
  };
  orders.unshift(newOrder);
  write(KEYS.orders, orders);
  syncToCustomerOrders(newOrder);
  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_orders_updated');
  }
  return newOrder;
}

/**
 * Confirms a pending order from the dedicated preview page:
 * - Validates order is Pending (prevents duplicate confirmation).
 * - Persists accepted quantity changes & recalculated totals.
 * - Transitions status to Confirmed.
 */
export function confirmPendingOrder(
  orderId: string,
  updatedItems?: OrderItem[],
  paymentStatus?: 'Paid' | 'Unpaid' | 'COD'
): { success: boolean; error?: string; order?: Order } {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false, error: `Order ${orderId} not found.` };
  const current = orders[idx];

  if (current.status !== 'Pending') {
    return {
      success: false,
      error: `Order ${orderId} has already been confirmed (current status: ${current.status}).`,
      order: current,
    };
  }

  let finalItems = current.items;
  let finalAmount = current.amount;

  if (updatedItems && updatedItems.length > 0) {
    for (const it of updatedItems) {
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        return { success: false, error: `Invalid quantity for ${it.productName}.` };
      }
    }
    const normalized: OrderItem[] = updatedItems.map((item) => {
      const unitPrice = getSellingPrice(item.productId) ?? item.unitPrice;
      const qty = item.quantity;
      const lineTotal = Math.round(qty * unitPrice * 100) / 100;
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: qty,
        unit: item.unit,
        unitPrice,
        lineTotal,
      };
    });
    finalItems = normalized;
    const subtotal = Math.round(finalItems.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
    const deliveryFee = subtotal > 0 && subtotal < 149 ? 25 : 0;
    finalAmount = Math.round((subtotal + deliveryFee) * 100) / 100;
  }

  orders[idx] = {
    ...current,
    status: 'Confirmed',
    items: finalItems,
    amount: finalAmount,
    ...(paymentStatus ? { paymentStatus } : {}),
  };

  write(KEYS.orders, orders);
  syncToCustomerOrders(orders[idx]);
  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_orders_updated');
  }

  return { success: true, order: orders[idx] };
}

/**
 * Finalizes an invoice and atomically manages inventory deduction and bill generation.
 */
export function finalizeOrderBill(
  orderId: string,
  items: OrderItem[],
  paymentStatus: 'Paid' | 'Unpaid'
): { success: boolean; error?: string; invoice?: Invoice } {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false, error: `Order ${orderId} not found.` };
  const order = orders[idx];

  if (order.status === 'Pending') {
    return { success: false, error: 'Cannot finalize invoice for a Pending order. Please confirm the order first.' };
  }

  const existingInv = getInvoiceByOrderId(orderId);
  if (existingInv && existingInv.status === 'Finalized') {
    return { success: true, invoice: existingInv };
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Cannot finalize bill with no items.' };
  }
  for (const it of items) {
    if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
      return { success: false, error: `Invalid quantity for ${it.productName}.` };
    }
  }

  // Stock availability check
  const inventory = getInventory();
  for (const it of items) {
    const invItem = inventory.find((i) => i.productId === it.productId);
    if (invItem && invItem.stockQty < it.quantity) {
      return {
        success: false,
        error: `Insufficient stock for “${it.productName}”. Available: ${invItem.stockQty} ${invItem.unit}, requested: ${it.quantity} ${invItem.unit}.`,
      };
    }
  }

  // Deduct inventory atomically
  if (!order.inventoryDeducted) {
    for (const it of items) {
      const invIdx = inventory.findIndex((i) => i.productId === it.productId);
      if (invIdx !== -1) {
        inventory[invIdx].stockQty = Math.max(0, inventory[invIdx].stockQty - it.quantity);
        inventory[invIdx].lastUpdated = new Date().toISOString();
      }
    }
    write(KEYS.inventory, inventory);
  }

  const normalizedItems: OrderItem[] = items.map((it) => {
    const unitPrice = getSellingPrice(it.productId) ?? it.unitPrice;
    const lineTotal = Math.round(it.quantity * unitPrice * 100) / 100;
    return { ...it, unitPrice, lineTotal };
  });
  const subtotal = Math.round(normalizedItems.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
  const deliveryFee = subtotal > 0 && subtotal < 149 ? 25 : 0;
  const grandTotal = Math.round((subtotal + deliveryFee) * 100) / 100;

  const invNum = generateInvoiceNumber();
  const invoice: Invoice = {
    id: `INV-${order.id}-${invNum}`,
    invoiceNumber: invNum,
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    customerAddress: order.address,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    discount: 0,
    total: grandTotal,
    paymentStatus,
    status: 'Finalized',
    createdAt: new Date().toISOString(),
    isManual: false,
  };

  saveInvoice(invoice);

  orders[idx] = {
    ...order,
    items: normalizedItems,
    amount: grandTotal,
    paymentStatus: paymentStatus === 'Paid' ? 'Paid' : order.paymentStatus === 'COD' ? 'COD' : 'Unpaid',
    invoiceFinalized: true,
    invoiceNumber: invNum,
    inventoryDeducted: true,
  };
  write(KEYS.orders, orders);
  syncToCustomerOrders(orders[idx]);

  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_orders_updated');
    dispatchCustomEvent('sabuja_inventory_updated');
  }

  return { success: true, invoice };
}

/**
 * Handles customer-side order cancellation with mandatory reason.
 * Restores inventory safely if deducted and prevents double-restocking.
 */
export function cancelCustomerOrder(
  orderId: string,
  reason: string,
  customerIdentifier?: string
): { success: boolean; error?: string } {
  const trimmedReason = reason ? reason.trim() : '';
  if (!trimmedReason) {
    return { success: false, error: 'A cancellation reason is mandatory. Please provide a reason.' };
  }

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    // If not in admin orders, check sabuja_user_orders directly
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sabuja_user_orders');
        const list = raw ? JSON.parse(raw) : [];
        const uIdx = list.findIndex((o: any) => o.id === orderId);
        if (uIdx !== -1) {
          if (list[uIdx].status?.toLowerCase().includes('delivered')) {
            return { success: false, error: 'Delivered orders cannot be cancelled.' };
          }
          if (list[uIdx].status?.toLowerCase().includes('cancel')) {
            return { success: false, error: 'This order is already cancelled.' };
          }
          list[uIdx].status = 'Cancelled';
          list[uIdx].cancellationReason = trimmedReason;
          list[uIdx].cancelledAt = new Date().toISOString();
          localStorage.setItem('sabuja_user_orders', JSON.stringify(list));
          dispatchCustomEvent('sabuja_orders_updated');
          return { success: true };
        }
      } catch {
        // ignore
      }
    }
    return { success: false, error: `Order ${orderId} was not found.` };
  }

  const order = orders[idx];

  if (customerIdentifier && customerIdentifier.trim()) {
    const cid = customerIdentifier.trim();
    if (order.customerId && order.customerId !== cid && order.customerPhone !== cid && order.customerEmail !== cid) {
      return { success: false, error: 'Unauthorized to cancel this order.' };
    }
  }

  if (order.status === 'Delivered') {
    return { success: false, error: 'Delivered orders cannot be cancelled.' };
  }
  if (order.status === 'Cancelled') {
    return { success: false, error: 'This order is already cancelled.' };
  }
  if (order.status === 'Could Not Deliver') {
    return { success: false, error: 'This order cannot be cancelled in its current state.' };
  }

  // Restore inventory if previously deducted and not yet restored
  if (order.inventoryDeducted && !order.inventoryRestocked) {
    const inventory = getInventory();
    for (const it of order.items) {
      const invIdx = inventory.findIndex((i) => i.productId === it.productId);
      if (invIdx !== -1) {
        inventory[invIdx].stockQty += it.quantity;
        inventory[invIdx].lastUpdated = new Date().toISOString();
      }
    }
    write(KEYS.inventory, inventory);
  }

  orders[idx] = {
    ...order,
    status: 'Cancelled',
    cancellationReason: trimmedReason,
    cancelledAt: new Date().toISOString(),
    inventoryRestocked: order.inventoryDeducted ? true : false,
  };

  if (orders[idx].deliveryPersonId) {
    unassignDeliveryPerson(orderId);
  }

  write(KEYS.orders, orders);
  syncToCustomerOrders(orders[idx]);

  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_orders_updated');
    dispatchCustomEvent('sabuja_inventory_updated');
  }

  return { success: true };
}

/**
 * Updates an order's line items and recalculates unit prices (derived from Inventory),
 * line totals, and order total amount without mutating any already-finalized invoice.
 */
export function updateOrderItems(
  id: string,
  items: OrderItem[],
  paymentStatus?: 'Paid' | 'Unpaid' | 'COD',
): Order | undefined {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1 || items.length === 0) return undefined;
  const normalized: OrderItem[] = items.map((item) => {
    const unitPrice = getSellingPrice(item.productId) ?? item.unitPrice;
    const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    const lineTotal = Math.round(qty * unitPrice * 100) / 100;
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: qty,
      unit: item.unit,
      unitPrice,
      lineTotal,
    };
  });
  const subtotal = Math.round(normalized.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100;
  const deliveryFee = subtotal > 0 && subtotal < 149 ? 25 : 0;
  orders[idx] = {
    ...orders[idx],
    items: normalized,
    amount: Math.round((subtotal + deliveryFee) * 100) / 100,
    ...(paymentStatus ? { paymentStatus } : {}),
  };
  write(KEYS.orders, orders);
  return orders[idx];
}

export function assignDeliveryPerson(orderId: string, dpId: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return false;
  // Remove from previous partner
  const partners = getDeliveryPartners();
  partners.forEach(dp => {
    dp.assignedOrders = dp.assignedOrders.filter(oid => oid !== orderId);
  });
  // Assign to new
  const dpIdx = partners.findIndex(dp => dp.id === dpId);
  if (dpIdx !== -1) {
    partners[dpIdx].assignedOrders.push(orderId);
  }
  orders[idx].deliveryPersonId = dpId;
  write(KEYS.orders, orders);
  write(KEYS.deliveryPartners, partners);
  return true;
}

export function unassignDeliveryPerson(orderId: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return false;
  const dpId = orders[idx].deliveryPersonId;
  orders[idx].deliveryPersonId = undefined;
  write(KEYS.orders, orders);
  if (dpId) {
    const partners = getDeliveryPartners();
    const dpIdx = partners.findIndex(dp => dp.id === dpId);
    if (dpIdx !== -1) {
      partners[dpIdx].assignedOrders = partners[dpIdx].assignedOrders.filter(oid => oid !== orderId);
      write(KEYS.deliveryPartners, partners);
    }
  }
  return true;
}

// ─── Customers ──────────────────────────────────────────────────────────────

export function getCustomers(): Customer[] { return read<Customer[]>(KEYS.customers, []); }

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

export function getCustomerOrders(customerId: string): Order[] {
  return getOrders().filter(o => o.customerId === customerId);
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export function getInventory(): InventoryItem[] { return read<InventoryItem[]>(KEYS.inventory, []); }

export function updateInventoryItem(productId: string, stockQty: number): boolean {
  if (stockQty < 0) return false;
  const items = getInventory();
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx === -1) return false;
  items[idx].stockQty = stockQty;
  items[idx].lastUpdated = new Date().toISOString();
  write(KEYS.inventory, items);
  return true;
}

export interface InventoryProductInput {
  productName: string;
  category: string;
  sellingPrice: number;
  offerPrice?: number;
  stockQty: number;
  unit: string;
  image?: string;
}

/** Validates product fields; returns an error message or '' when valid. */
export function validateInventoryInput(input: InventoryProductInput, ignoreId?: string): string {
  const name = input.productName.trim();
  if (!name) return 'Product name is required.';
  if (!input.category.trim()) return 'Category is required.';
  if (!Number.isFinite(input.sellingPrice) || input.sellingPrice <= 0) return 'Selling price must be greater than 0.';
  if (
    input.offerPrice !== undefined &&
    input.offerPrice !== null &&
    !Number.isNaN(input.offerPrice) &&
    String(input.offerPrice).trim() !== ''
  ) {
    if (input.offerPrice <= 0) return 'Offer price must be greater than 0.';
    if (input.offerPrice > input.sellingPrice) return 'Offer price cannot exceed selling price.';
  }
  if (!Number.isFinite(input.stockQty) || input.stockQty < 0) return 'Stock cannot be negative.';
  if (input.unit !== 'kg' && !Number.isInteger(input.stockQty)) return `Stock must be a whole number for ${input.unit}.`;
  if (getInventory().some((i) => i.productId !== ignoreId && i.productName.trim().toLowerCase() === name.toLowerCase())) {
    return `A product named “${name}” already exists.`;
  }
  return '';
}

/** Edits name, price, offer price, stock, category, unit and image of an existing product. Stock status is derived from quantity. */
export function updateInventoryProduct(productId: string, input: InventoryProductInput): string {
  const err = validateInventoryInput(input, productId);
  if (err) return err;
  const items = getInventory();
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx === -1) return 'Product not found.';
  const hasOffer =
    input.offerPrice !== undefined &&
    input.offerPrice !== null &&
    Number.isFinite(input.offerPrice) &&
    input.offerPrice > 0 &&
    input.offerPrice <= input.sellingPrice;

  items[idx] = {
    ...items[idx],
    productName: input.productName.trim(),
    category: input.category.trim(),
    unit: input.unit || items[idx].unit,
    sellingPrice: input.sellingPrice,
    offerPrice: hasOffer ? input.offerPrice : undefined,
    stockQty: input.stockQty,
    image: input.image?.trim() || items[idx].image,
    lastUpdated: new Date().toISOString(),
  };
  write(KEYS.inventory, items);
  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_inventory_updated');
  }
  return '';
}

/** Adds a new product to the shared inventory list. Returns an error message, or '' on success. */
export function addInventoryProduct(input: InventoryProductInput): string {
  const err = validateInventoryInput(input);
  if (err) return err;
  const items = getInventory();
  const hasOffer =
    input.offerPrice !== undefined &&
    input.offerPrice !== null &&
    Number.isFinite(input.offerPrice) &&
    input.offerPrice > 0 &&
    input.offerPrice <= input.sellingPrice;

  items.push({
    productId: generateId('custom'),
    productName: input.productName.trim(),
    category: input.category.trim(),
    subcategory: 'custom',
    stockQty: input.stockQty,
    unit: input.unit,
    sellingPrice: input.sellingPrice,
    offerPrice: hasOffer ? input.offerPrice : undefined,
    costPerUnit: 0,
    lastUpdated: new Date().toISOString(),
    image: input.image?.trim() || undefined,
    custom: true,
  });
  write(KEYS.inventory, items);
  if (typeof window !== 'undefined') {
    dispatchCustomEvent('sabuja_inventory_updated');
  }
  return '';
}

/** Current authoritative selling price for billing (uses active offer price if configured, else selling price). */
export function getSellingPrice(productId: string): number | undefined {
  const item = getInventory().find((i) => i.productId === productId);
  if (!item) return undefined;
  if (item.offerPrice !== undefined && item.offerPrice > 0 && item.offerPrice < item.sellingPrice) {
    return item.offerPrice;
  }
  return item.sellingPrice;
}

export function getRegularPrice(productId: string): number | undefined {
  return getInventory().find((i) => i.productId === productId)?.sellingPrice;
}

export function getOfferPrice(productId: string): number | undefined {
  return getInventory().find((i) => i.productId === productId)?.offerPrice;
}

export interface BillingProduct { id: string; name: string; unit: string; price: number }

export function getBillingProducts(): BillingProduct[] {
  return getInventory().map((i) => ({ id: i.productId, name: i.productName, unit: i.unit, price: i.sellingPrice }));
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export function getExpenses(): Expense[] { return read<Expense[]>(KEYS.expenses, []); }

export function addExpense(expense: Omit<Expense, 'id'>): Expense {
  const expenses = getExpenses();
  const newExp: Expense = { ...expense, id: generateId('EXP') };
  expenses.push(newExp);
  write(KEYS.expenses, expenses);
  return newExp;
}

export function updateExpense(id: string, changes: Partial<Expense>): boolean {
  const expenses = getExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  expenses[idx] = { ...expenses[idx], ...changes, id }; // preserve id
  write(KEYS.expenses, expenses);
  return true;
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  if (filtered.length === expenses.length) return false;
  write(KEYS.expenses, filtered);
  return true;
}

// ─── Delivery Partners ──────────────────────────────────────────────────────

export function getDeliveryPartners(): DeliveryPartner[] {
  const raw = read<Array<DeliveryPartner & { status?: string }>>(KEYS.deliveryPartners, []);
  return raw.map((p) => ({
    ...p,
    active: typeof p.active === 'boolean' ? p.active : p.status ? p.status === 'Active' : true,
    assignedOrders: Array.isArray(p.assignedOrders) ? p.assignedOrders : [],
  }));
}

export function addDeliveryPartner(data: { name: string; phone: string; notes: string }): DeliveryPartner {
  const partners = getDeliveryPartners();
  const dp: DeliveryPartner = { ...data, id: generateId('DP'), active: true, assignedOrders: [] };
  partners.push(dp);
  write(KEYS.deliveryPartners, partners);
  return dp;
}

export function updateDeliveryPartner(id: string, changes: Partial<DeliveryPartner>): boolean {
  const partners = getDeliveryPartners();
  const idx = partners.findIndex(dp => dp.id === id);
  if (idx === -1) return false;
  partners[idx] = { ...partners[idx], ...changes, id };
  write(KEYS.deliveryPartners, partners);
  return true;
}

export function setDeliveryPartnerStatus(id: string, active: boolean): boolean {
  return updateDeliveryPartner(id, { active });
}

export function activateDeliveryPartner(id: string): boolean {
  return updateDeliveryPartner(id, { active: true });
}

export function deactivateDeliveryPartner(id: string): boolean {
  return updateDeliveryPartner(id, { active: false });
}

// ─── Invoices ───────────────────────────────────────────────────────────────

export function getInvoices(): Invoice[] { return read<Invoice[]>(KEYS.invoices, []); }

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find(inv => inv.id === id);
}

export function getInvoiceByOrderId(orderId: string): Invoice | undefined {
  return getInvoices().find(inv => inv.orderId === orderId && inv.status === 'Finalized');
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const seq = getInvoices().length + 1;
  return `SH-INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(seq).padStart(3, '0')}`;
}

export function saveInvoice(invoice: Invoice): Invoice {
  const invoices = getInvoices();
  // Prevent duplicate finalization for same order
  if (invoice.orderId) {
    const existing = invoices.find(inv => inv.orderId === invoice.orderId && inv.status === 'Finalized');
    if (existing) return existing; // already finalized
  }
  const idx = invoices.findIndex(inv => inv.id === invoice.id);
  if (idx >= 0) {
    invoices[idx] = invoice;
  } else {
    invoices.push(invoice);
  }
  write(KEYS.invoices, invoices);
  return invoice;
}

// ─── Customer Notes ─────────────────────────────────────────────────────────

export function getCustomerNotes(customerId: string): CustomerNote[] {
  return read<CustomerNote[]>(KEYS.customerNotes, []).filter(n => n.customerId === customerId);
}

export function addCustomerNote(customerId: string, text: string): CustomerNote {
  const notes = read<CustomerNote[]>(KEYS.customerNotes, []);
  const note: CustomerNote = { id: generateId('NOTE'), customerId, text, createdAt: new Date().toISOString() };
  notes.push(note);
  write(KEYS.customerNotes, notes);
  return note;
}

// ─── Product Lookup ─────────────────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

// ─── Analytics Helpers ──────────────────────────────────────────────────────

export function getOrdersInRange(start: Date, end: Date): Order[] {
  return getOrders().filter(o => {
    const d = new Date(o.date);
    return d >= start && d <= end;
  });
}

export function getRevenueInRange(start: Date, end: Date): number {
  return getOrdersInRange(start, end)
    .filter(o => o.status !== 'Cancelled')
    .reduce((s, o) => s + o.amount, 0);
}

export function getTopSellingProducts(limit = 5): { productName: string; totalQty: number; totalRevenue: number }[] {
  const map = new Map<string, { productName: string; totalQty: number; totalRevenue: number }>();
  for (const order of getOrders()) {
    if (order.status === 'Cancelled') continue;
    for (const item of order.items) {
      const existing = map.get(item.productId) || { productName: item.productName, totalQty: 0, totalRevenue: 0 };
      existing.totalQty += item.quantity;
      existing.totalRevenue += item.lineTotal;
      map.set(item.productId, existing);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
}

export function getOrderStatusCounts(): Record<OrderStatus, number> {
  const counts: Record<string, number> = { 'Pending': 0, 'Confirmed': 0, 'Ready': 0, 'Out for Delivery': 0, 'Delivered': 0, 'Cancelled': 0, 'Could Not Deliver': 0 };
  for (const o of getOrders()) {
    counts[o.status] = (counts[o.status] || 0) + 1;
  }
  return counts as Record<OrderStatus, number>;
}

export function getLowStockItems(threshold = 10): InventoryItem[] {
  return getInventory().filter(i => i.stockQty <= threshold && i.stockQty > 0);
}

export function getOutOfStockItems(): InventoryItem[] {
  return getInventory().filter(i => i.stockQty === 0);
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(headers: string[], rows: string[][], filename: string): void {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Derived customer stats (single source of truth = orders) ────────────────

export interface CustomerStats extends Customer {
  orderCount: number;
  spent: number;
  firstOrder: string;
  lastOrder: string;
}

export function getCustomerStats(): CustomerStats[] {
  const orders = getOrders();
  return getCustomers().map((c) => {
    const mine = orders.filter((o) => o.customerId === c.id || (!o.customerId && o.customerPhone === c.phone));
    const valid = mine.filter((o) => o.status !== 'Cancelled');
    const sortedDates = mine.map((o) => o.date).filter(Boolean).sort();
    return {
      ...c,
      orderCount: mine.length,
      spent: Math.round(valid.reduce((s, o) => s + o.amount, 0) * 100) / 100,
      firstOrder: sortedDates[0] ?? '',
      lastOrder: sortedDates[sortedDates.length - 1] ?? c.lastOrderDate ?? '',
    };
  });
}

export function getCustomerStat(id: string): CustomerStats | undefined {
  return getCustomerStats().find((c) => c.id === id);
}
