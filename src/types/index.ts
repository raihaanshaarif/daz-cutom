export interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "BLOCK";
  phone?: string;
  picture?: string | null;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
  assignedBuyers?: Buyer[];
}

export interface Country {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Buyer {
  id: number;
  name: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
}

export interface Factory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  shipDate?: string;
  dept?: string;
  style?: string;
  color?: string;
  lot?: string;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  factoryUnitPrice?: number;
  totalFactoryPrice?: number;
  dazCommission?: number;
  discountFactory?: number | null;
  discountFromDaz?: number | null;
  discountRemark?: string | null;
  finalDazCommission?: number;
  paymentTerm?: string;
  yarnBooking?: string | null;
  labdipYarndip?: string | null;
  printStrikeOff?: string | null;
  ppSample?: string | null;
  bulkFabric?: string | null;
  cutting?: string | null;
  printing?: string | null;
  swing?: string | null;
  finishing?: string | null;
  shipmentSample?: string | null;
  inspection?: string | null;
  exFactory?: string | null;
  overallRemarks?: string;
  commissionStatus?: string;
  commissionAmount?: number | null;
  buyerId?: number;
  buyer?: Buyer;
  factoryId?: number;
  factory?: Factory;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialOrder {
  id: number;
  commercialId: number;
  orderId: number;
  order: Order;
}

export interface Commercial {
  id: number;
  bookingReference: string;
  invoiceNo: string;
  quantity: number;
  totalPrice: number;
  bookingDate: string;
  bookingHandoverDate: string;
  handoverDate: string;
  etd: string;
  eta: string;
  lacAmount: number;
  documentStatus: string;
  docCourierNo: string;
  approximatePaymentDate?: string | null;
  paymentStatus: string;
  receivedAmount: number;
  receivedDate: string;
  balance: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  orders: CommercialOrder[];
}

export interface CommercialFormData {
  bookingReference: string;
  invoiceNo: string;
  quantity: number;
  totalPrice: number;
  bookingDate: string;
  bookingHandoverDate: string;
  handoverDate: string;
  etd: string;
  eta: string;
  lacAmount: number;
  documentStatus: string;
  docCourierNo: string;
  approximatePaymentDate?: string | null;
  paymentStatus: string;
  receivedAmount: number;
  receivedDate: string;
  balance: number;
  remarks: string;
}

export interface OrderItem {
  id: number;
  orderNumber?: string;
  shipDate?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  department?: string;
  style?: string;
  color?: string;
  lot?: string;
  factoryPrice?: number;
  totalFactoryPrice?: number;
  dazCommission?: number;
  finalDazCommission?: number;
  paymentTerm?: string;
  buyerName?: string;
  factoryName?: string;
  yarnBooking?: string | null;
  labYarn?: string | null;
  printStrikeoff?: string | null;
  pp?: string | null;
  bulkFab?: string | null;
  cutting?: string | null;
  printing?: string | null;
  swing?: string | null;
  finishing?: string | null;
  shipmentSample?: string | null;
  inspection?: string | null;
  exfactory?: string | null;
  overallRemarks?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: {
    PENDING: number;
    CONFIRMED: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  recentOrders?: Order[];
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  designation?: string;
  company: string;
  domain?: string;
  country?: Country;
  countryId?: number;
  companyLinkedin?: string;
  personalLinkedin?: string;
  status:
    | "NOT_CONTACTED"
    | "CONTACTED"
    | "FOLLOW_UP_SENT"
    | "ENGAGED"
    | "INTERESTED"
    | "QUALIFIED"
    | "CATALOG_SENT"
    | "SAMPLE_REQUESTED"
    | "SAMPLE_SENT"
    | "PRICE_NEGOTIATION"
    | "CLOSED_WON"
    | "REPEAT_BUYER"
    | "NON_RESPONSIVE"
    | "REENGAGED"
    | "DORMANT"
    | "NOT_INTERESTED"
    | "INVALID"
    | "DO_NOT_CONTACT";
  note?: string;
  authorId: number;
  author?: User;
  lastContactedAt?: string;
  lastRepliedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  designation?: string;
  company: string;
  domain?: string;
  country?: number;
  companyLinkedin?: string;
  personalLinkedin?: string;
  status: Contact["status"];
  note?: string;
  lastContactedAt?: string;
  lastRepliedAt?: string;
  nextFollowUpAt?: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PerformanceMetrics {
  totalLeadsToday: number;
  leadsByEmployee: Array<{
    employeeId: number;
    employeeName: string;
    leadsCount: number;
  }>;
  leadsByStatus: Record<Contact["status"], number>;
  conversionRate: number;
}

export type TaskStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface TaskDailyLog {
  id: number;
  taskId: number;
  date: string;
  targetValue: number;
  achieved: number;
  performance?: number;
  status: TaskStatus;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  assignedById: number;
  assignedToId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: User;
  assignedTo?: User;
  dailyLogs?: TaskDailyLog[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  targetValue: number;
  assignedToId: number;
}
