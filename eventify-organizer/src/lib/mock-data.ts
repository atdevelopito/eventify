// Mock data for the event management platform
// This simulates real data that would come from a database

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  location: string;
  venue: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  category: string;
  capacity: number;
  registrations: number;
  ticketsSold: number;
  revenue: number;
  image?: string;
  isOnline: boolean;
  timezone: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded';
  registeredAt: Date;
  checkedIn: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  status: 'active' | 'sold_out' | 'hidden';
  salesStart: Date;
  salesEnd: Date;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventsAttended: number;
  totalSpent: number;
  lastEventDate: Date;
  status: 'active' | 'vip' | 'blocked';
  notes?: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'paused';
  applicableEvents: string[];
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  createdAt: Date;
  completedAt?: Date;
  eventIds: string[];
}

export interface Review {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  status: 'published' | 'hidden' | 'flagged';
  response?: string;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sold: number;
  status: 'active' | 'out_of_stock' | 'hidden';
  image?: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  type: 'registration' | 'survey' | 'feedback' | 'custom';
  fields: number;
  responses: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  lastModified: Date;
}

// Generate mock events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring industry leaders',
    date: new Date('2024-03-15T09:00:00'),
    endDate: new Date('2024-03-15T18:00:00'),
    location: 'San Francisco, CA',
    venue: 'Moscone Center',
    status: 'published',
    category: 'Conference',
    capacity: 500,
    registrations: 342,
    ticketsSold: 412,
    revenue: 24720,
    isOnline: false,
    timezone: 'America/Los_Angeles',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50935278?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: '2',
    title: 'Web Development Workshop',
    description: 'Hands-on workshop covering modern web development practices',
    date: new Date('2024-03-20T14:00:00'),
    endDate: new Date('2024-03-20T17:00:00'),
    location: 'Online',
    venue: 'Zoom',
    status: 'published',
    category: 'Workshop',
    capacity: 100,
    registrations: 87,
    ticketsSold: 87,
    revenue: 4350,
    isOnline: true,
    timezone: 'America/New_York',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: '3',
    title: 'Startup Networking Night',
    description: 'Connect with fellow entrepreneurs and investors',
    date: new Date('2024-03-25T18:00:00'),
    endDate: new Date('2024-03-25T21:00:00'),
    location: 'New York, NY',
    venue: 'WeWork Times Square',
    status: 'published',
    category: 'Networking',
    capacity: 150,
    registrations: 134,
    ticketsSold: 134,
    revenue: 0,
    isOnline: false,
    timezone: 'America/New_York',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: '4',
    title: 'AI & Machine Learning Summit',
    description: 'Exploring the future of artificial intelligence',
    date: new Date('2024-04-05T09:00:00'),
    endDate: new Date('2024-04-06T17:00:00'),
    location: 'Austin, TX',
    venue: 'Austin Convention Center',
    status: 'draft',
    category: 'Conference',
    capacity: 800,
    registrations: 0,
    ticketsSold: 0,
    revenue: 0,
    isOnline: false,
    timezone: 'America/Chicago',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: '5',
    title: 'Design Systems Masterclass',
    description: 'Learn to build scalable design systems',
    date: new Date('2024-04-10T10:00:00'),
    endDate: new Date('2024-04-10T16:00:00'),
    location: 'Online',
    venue: 'Google Meet',
    status: 'published',
    category: 'Workshop',
    capacity: 50,
    registrations: 48,
    ticketsSold: 48,
    revenue: 7200,
    isOnline: true,
    timezone: 'America/Los_Angeles',
  },
  {
    id: '6',
    title: 'Product Management Forum',
    description: 'Best practices in modern product management',
    date: new Date('2024-04-15T09:00:00'),
    endDate: new Date('2024-04-15T17:00:00'),
    location: 'Seattle, WA',
    venue: 'Amazon Meeting Center',
    status: 'published',
    category: 'Conference',
    capacity: 300,
    registrations: 156,
    ticketsSold: 189,
    revenue: 18900,
    isOnline: false,
    timezone: 'America/Los_Angeles',
  },
  {
    id: '7',
    title: 'Cybersecurity Workshop',
    description: 'Hands-on security training for developers',
    date: new Date('2024-02-20T09:00:00'),
    endDate: new Date('2024-02-20T17:00:00'),
    location: 'Boston, MA',
    venue: 'MIT Media Lab',
    status: 'completed',
    category: 'Workshop',
    capacity: 75,
    registrations: 75,
    ticketsSold: 75,
    revenue: 11250,
    isOnline: false,
    timezone: 'America/New_York',
  },
  {
    id: '8',
    title: 'UX Research Methods',
    description: 'Deep dive into user research methodologies',
    date: new Date('2024-04-22T13:00:00'),
    endDate: new Date('2024-04-22T17:00:00'),
    location: 'Online',
    venue: 'Zoom',
    status: 'published',
    category: 'Workshop',
    capacity: 40,
    registrations: 28,
    ticketsSold: 28,
    revenue: 2800,
    isOnline: true,
    timezone: 'America/New_York',
  },
  {
    id: '9',
    title: 'Cloud Architecture Summit',
    description: 'Enterprise cloud solutions and best practices',
    date: new Date('2024-05-01T09:00:00'),
    endDate: new Date('2024-05-02T17:00:00'),
    location: 'Chicago, IL',
    venue: 'McCormick Place',
    status: 'published',
    category: 'Conference',
    capacity: 600,
    registrations: 234,
    ticketsSold: 298,
    revenue: 44700,
    isOnline: false,
    timezone: 'America/Chicago',
  },
  {
    id: '10',
    title: 'Frontend Frameworks Showdown',
    description: 'Comparing React, Vue, and Angular in 2024',
    date: new Date('2024-05-10T15:00:00'),
    endDate: new Date('2024-05-10T18:00:00'),
    location: 'Online',
    venue: 'YouTube Live',
    status: 'draft',
    category: 'Webinar',
    capacity: 1000,
    registrations: 0,
    ticketsSold: 0,
    revenue: 0,
    isOnline: true,
    timezone: 'America/Los_Angeles',
  },
];

// Generate mock registrations
export const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    attendeeName: 'John Smith',
    attendeeEmail: 'john.smith@email.com',
    ticketType: 'VIP Pass',
    quantity: 1,
    totalAmount: 299,
    status: 'confirmed',
    registeredAt: new Date('2024-02-15T10:30:00'),
    checkedIn: true,
  },
  {
    id: 'reg-2',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    attendeeName: 'Sarah Johnson',
    attendeeEmail: 'sarah.j@company.com',
    ticketType: 'Early Bird',
    quantity: 2,
    totalAmount: 198,
    status: 'confirmed',
    registeredAt: new Date('2024-02-14T14:20:00'),
    checkedIn: true,
  },
  {
    id: 'reg-3',
    eventId: '2',
    eventTitle: 'Web Development Workshop',
    attendeeName: 'Mike Chen',
    attendeeEmail: 'mike.chen@dev.io',
    ticketType: 'Standard',
    quantity: 1,
    totalAmount: 50,
    status: 'confirmed',
    registeredAt: new Date('2024-03-01T09:15:00'),
    checkedIn: false,
  },
  {
    id: 'reg-4',
    eventId: '3',
    eventTitle: 'Startup Networking Night',
    attendeeName: 'Emily Davis',
    attendeeEmail: 'emily@startup.co',
    ticketType: 'Free',
    quantity: 1,
    totalAmount: 0,
    status: 'confirmed',
    registeredAt: new Date('2024-03-10T16:45:00'),
    checkedIn: false,
  },
  {
    id: 'reg-5',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    attendeeName: 'David Wilson',
    attendeeEmail: 'david.w@tech.com',
    ticketType: 'General Admission',
    quantity: 3,
    totalAmount: 177,
    status: 'pending',
    registeredAt: new Date('2024-02-28T11:00:00'),
    checkedIn: false,
  },
  {
    id: 'reg-6',
    eventId: '5',
    eventTitle: 'Design Systems Masterclass',
    attendeeName: 'Lisa Anderson',
    attendeeEmail: 'lisa.a@design.co',
    ticketType: 'Workshop Pass',
    quantity: 1,
    totalAmount: 150,
    status: 'confirmed',
    registeredAt: new Date('2024-03-05T13:30:00'),
    checkedIn: false,
  },
  {
    id: 'reg-7',
    eventId: '6',
    eventTitle: 'Product Management Forum',
    attendeeName: 'Robert Taylor',
    attendeeEmail: 'robert.t@pm.io',
    ticketType: 'VIP',
    quantity: 1,
    totalAmount: 200,
    status: 'cancelled',
    registeredAt: new Date('2024-03-08T10:00:00'),
    checkedIn: false,
  },
  {
    id: 'reg-8',
    eventId: '9',
    eventTitle: 'Cloud Architecture Summit',
    attendeeName: 'Jennifer Martinez',
    attendeeEmail: 'jen.m@cloud.tech',
    ticketType: 'Professional',
    quantity: 2,
    totalAmount: 300,
    status: 'confirmed',
    registeredAt: new Date('2024-03-12T15:20:00'),
    checkedIn: false,
  },
];

// Generate mock tickets
export const mockTickets: Ticket[] = [
  {
    id: 'tkt-1',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    name: 'VIP Pass',
    description: 'Full access including exclusive networking sessions',
    price: 299,
    quantity: 50,
    sold: 42,
    status: 'active',
    salesStart: new Date('2024-01-01'),
    salesEnd: new Date('2024-03-14'),
  },
  {
    id: 'tkt-2',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    name: 'Early Bird',
    description: 'Discounted general admission',
    price: 99,
    quantity: 200,
    sold: 200,
    status: 'sold_out',
    salesStart: new Date('2024-01-01'),
    salesEnd: new Date('2024-02-15'),
  },
  {
    id: 'tkt-3',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    name: 'General Admission',
    description: 'Standard conference access',
    price: 149,
    quantity: 250,
    sold: 170,
    status: 'active',
    salesStart: new Date('2024-02-16'),
    salesEnd: new Date('2024-03-14'),
  },
  {
    id: 'tkt-4',
    eventId: '2',
    eventTitle: 'Web Development Workshop',
    name: 'Standard',
    description: 'Workshop access with materials',
    price: 50,
    quantity: 100,
    sold: 87,
    status: 'active',
    salesStart: new Date('2024-02-01'),
    salesEnd: new Date('2024-03-19'),
  },
  {
    id: 'tkt-5',
    eventId: '3',
    eventTitle: 'Startup Networking Night',
    name: 'Free',
    description: 'Complimentary networking event access',
    price: 0,
    quantity: 150,
    sold: 134,
    status: 'active',
    salesStart: new Date('2024-02-15'),
    salesEnd: new Date('2024-03-24'),
  },
  {
    id: 'tkt-6',
    eventId: '5',
    eventTitle: 'Design Systems Masterclass',
    name: 'Workshop Pass',
    description: 'Full day workshop with certification',
    price: 150,
    quantity: 50,
    sold: 48,
    status: 'active',
    salesStart: new Date('2024-03-01'),
    salesEnd: new Date('2024-04-09'),
  },
];

// Generate mock attendees
export const mockAttendees: Attendee[] = [
  {
    id: 'att-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    eventsAttended: 5,
    totalSpent: 847,
    lastEventDate: new Date('2024-02-20'),
    status: 'vip',
    notes: 'Regular attendee, prefers VIP experiences',
  },
  {
    id: 'att-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 234-5678',
    eventsAttended: 3,
    totalSpent: 446,
    lastEventDate: new Date('2024-02-15'),
    status: 'active',
  },
  {
    id: 'att-3',
    name: 'Mike Chen',
    email: 'mike.chen@dev.io',
    phone: '+1 (555) 345-6789',
    eventsAttended: 8,
    totalSpent: 1250,
    lastEventDate: new Date('2024-03-01'),
    status: 'vip',
    notes: 'Developer advocate, interested in tech events',
  },
  {
    id: 'att-4',
    name: 'Emily Davis',
    email: 'emily@startup.co',
    phone: '+1 (555) 456-7890',
    eventsAttended: 2,
    totalSpent: 149,
    lastEventDate: new Date('2024-03-10'),
    status: 'active',
  },
  {
    id: 'att-5',
    name: 'David Wilson',
    email: 'david.w@tech.com',
    phone: '+1 (555) 567-8901',
    eventsAttended: 1,
    totalSpent: 177,
    lastEventDate: new Date('2024-02-28'),
    status: 'active',
  },
  {
    id: 'att-6',
    name: 'Lisa Anderson',
    email: 'lisa.a@design.co',
    phone: '+1 (555) 678-9012',
    eventsAttended: 4,
    totalSpent: 600,
    lastEventDate: new Date('2024-03-05'),
    status: 'active',
    notes: 'Design professional, interested in UX events',
  },
];

// Generate mock promotions
export const mockPromotions: Promotion[] = [
  {
    id: 'promo-1',
    code: 'EARLYBIRD20',
    description: '20% off for early registrations',
    discountType: 'percentage',
    discountValue: 20,
    usageLimit: 100,
    usageCount: 67,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-03-31'),
    status: 'active',
    applicableEvents: ['1', '2', '5'],
  },
  {
    id: 'promo-2',
    code: 'WELCOME50',
    description: '$50 off your first event',
    discountType: 'fixed',
    discountValue: 50,
    usageLimit: 50,
    usageCount: 23,
    validFrom: new Date('2024-02-01'),
    validUntil: new Date('2024-04-30'),
    status: 'active',
    applicableEvents: ['1', '6', '9'],
  },
  {
    id: 'promo-3',
    code: 'SUMMER15',
    description: '15% summer discount',
    discountType: 'percentage',
    discountValue: 15,
    usageLimit: 200,
    usageCount: 0,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    status: 'paused',
    applicableEvents: [],
  },
  {
    id: 'promo-4',
    code: 'VIP100',
    description: '$100 off VIP tickets',
    discountType: 'fixed',
    discountValue: 100,
    usageLimit: 25,
    usageCount: 25,
    validFrom: new Date('2024-01-15'),
    validUntil: new Date('2024-02-28'),
    status: 'expired',
    applicableEvents: ['1'],
  },
];

// Generate mock payouts
export const mockPayouts: Payout[] = [
  {
    id: 'pay-1',
    amount: 15420,
    status: 'completed',
    method: 'Bank Transfer',
    createdAt: new Date('2024-02-28'),
    completedAt: new Date('2024-03-02'),
    eventIds: ['7'],
  },
  {
    id: 'pay-2',
    amount: 8750,
    status: 'completed',
    method: 'Bank Transfer',
    createdAt: new Date('2024-03-05'),
    completedAt: new Date('2024-03-07'),
    eventIds: ['1', '2'],
  },
  {
    id: 'pay-3',
    amount: 12340,
    status: 'processing',
    method: 'Bank Transfer',
    createdAt: new Date('2024-03-10'),
    eventIds: ['1', '5', '6'],
  },
  {
    id: 'pay-4',
    amount: 5200,
    status: 'pending',
    method: 'PayPal',
    createdAt: new Date('2024-03-12'),
    eventIds: ['9'],
  },
];

// Generate mock reviews
export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    eventId: '7',
    eventTitle: 'Cybersecurity Workshop',
    attendeeName: 'Alex Thompson',
    rating: 5,
    comment: 'Excellent workshop! The hands-on exercises were incredibly valuable. Learned so much about security best practices.',
    createdAt: new Date('2024-02-22'),
    status: 'published',
    response: 'Thank you for the kind words, Alex! We\'re glad you found the workshop valuable.',
  },
  {
    id: 'rev-2',
    eventId: '7',
    eventTitle: 'Cybersecurity Workshop',
    attendeeName: 'Maria Garcia',
    rating: 4,
    comment: 'Great content and knowledgeable instructors. Would have liked more time for Q&A.',
    createdAt: new Date('2024-02-23'),
    status: 'published',
  },
  {
    id: 'rev-3',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    attendeeName: 'James Lee',
    rating: 5,
    comment: 'Best tech conference I\'ve attended. Amazing speakers and networking opportunities.',
    createdAt: new Date('2024-03-16'),
    status: 'published',
  },
  {
    id: 'rev-4',
    eventId: '2',
    eventTitle: 'Web Development Workshop',
    attendeeName: 'Sophie Brown',
    rating: 3,
    comment: 'Good workshop but felt a bit rushed. Material could have been more organized.',
    createdAt: new Date('2024-03-21'),
    status: 'published',
  },
  {
    id: 'rev-5',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    attendeeName: 'Anonymous',
    rating: 1,
    comment: 'Spam review content...',
    createdAt: new Date('2024-03-17'),
    status: 'flagged',
  },
];

// Generate mock merchandise
export const mockMerchandise: MerchandiseItem[] = [
  {
    id: 'merch-1',
    name: 'Conference T-Shirt',
    description: 'Premium cotton t-shirt with event branding',
    price: 25,
    category: 'Apparel',
    stock: 100,
    sold: 67,
    status: 'active',
  },
  {
    id: 'merch-2',
    name: 'Event Hoodie',
    description: 'Comfortable hoodie with embroidered logo',
    price: 55,
    category: 'Apparel',
    stock: 50,
    sold: 42,
    status: 'active',
  },
  {
    id: 'merch-3',
    name: 'Sticker Pack',
    description: 'Set of 10 vinyl stickers',
    price: 10,
    category: 'Accessories',
    stock: 200,
    sold: 156,
    status: 'active',
  },
  {
    id: 'merch-4',
    name: 'Notebook',
    description: 'A5 hardcover notebook with 120 pages',
    price: 15,
    category: 'Stationery',
    stock: 0,
    sold: 75,
    status: 'out_of_stock',
  },
  {
    id: 'merch-5',
    name: 'Water Bottle',
    description: 'Insulated stainless steel bottle',
    price: 30,
    category: 'Accessories',
    stock: 40,
    sold: 28,
    status: 'active',
  },
];

// Generate mock forms
export const mockForms: Form[] = [
  {
    id: 'form-1',
    name: 'Event Registration Form',
    description: 'Standard registration form for all events',
    type: 'registration',
    fields: 8,
    responses: 1247,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-02-28'),
  },
  {
    id: 'form-2',
    name: 'Post-Event Survey',
    description: 'Feedback survey sent after each event',
    type: 'survey',
    fields: 12,
    responses: 423,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    lastModified: new Date('2024-03-01'),
  },
  {
    id: 'form-3',
    name: 'Speaker Application',
    description: 'Application form for prospective speakers',
    type: 'custom',
    fields: 15,
    responses: 89,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastModified: new Date('2024-02-15'),
  },
  {
    id: 'form-4',
    name: 'Workshop Feedback',
    description: 'Quick feedback form for workshops',
    type: 'feedback',
    fields: 5,
    responses: 234,
    status: 'active',
    createdAt: new Date('2024-02-10'),
    lastModified: new Date('2024-03-05'),
  },
  {
    id: 'form-5',
    name: 'Volunteer Signup',
    description: 'Form for event volunteer applications',
    type: 'custom',
    fields: 10,
    responses: 56,
    status: 'draft',
    createdAt: new Date('2024-03-01'),
    lastModified: new Date('2024-03-08'),
  },
];

// Dashboard statistics
export const dashboardStats = {
  totalEvents: mockEvents.length,
  publishedEvents: mockEvents.filter(e => e.status === 'published').length,
  upcomingEvents: mockEvents.filter(e => e.date > new Date() && e.status === 'published').length,
  totalRegistrations: mockRegistrations.length,
  confirmedRegistrations: mockRegistrations.filter(r => r.status === 'confirmed').length,
  totalRevenue: mockEvents.reduce((sum, e) => sum + e.revenue, 0),
  totalAttendees: mockAttendees.length,
  averageRating: mockReviews.filter(r => r.status === 'published').reduce((sum, r) => sum + r.rating, 0) / mockReviews.filter(r => r.status === 'published').length,
  ticketsSold: mockTickets.reduce((sum, t) => sum + t.sold, 0),
  pendingPayouts: mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0),
};

// Recent activity for dashboard
export const recentActivity = [
  { id: '1', type: 'registration', message: 'New registration for Tech Conference 2024', time: '2 minutes ago' },
  { id: '2', type: 'review', message: 'New 5-star review received', time: '15 minutes ago' },
  { id: '3', type: 'ticket', message: '3 VIP tickets sold', time: '1 hour ago' },
  { id: '4', type: 'payout', message: 'Payout of $8,750 completed', time: '2 hours ago' },
  { id: '5', type: 'event', message: 'Design Systems Masterclass is almost full', time: '3 hours ago' },
  { id: '6', type: 'registration', message: '5 new registrations for Cloud Summit', time: '4 hours ago' },
];

// Chart data for analytics
export const registrationChartData = [
  { name: 'Jan', registrations: 45, revenue: 4500 },
  { name: 'Feb', registrations: 78, revenue: 9100 },
  { name: 'Mar', registrations: 156, revenue: 18700 },
  { name: 'Apr', registrations: 89, revenue: 12400 },
  { name: 'May', registrations: 234, revenue: 28900 },
  { name: 'Jun', registrations: 0, revenue: 0 },
];

export const ticketTypeData = [
  { name: 'VIP', value: 42, color: 'hsl(var(--primary))' },
  { name: 'Early Bird', value: 200, color: 'hsl(var(--info))' },
  { name: 'General', value: 170, color: 'hsl(var(--success))' },
  { name: 'Free', value: 134, color: 'hsl(var(--muted-foreground))' },
];

export const eventCategories = [
  'Conference',
  'Workshop',
  'Networking',
  'Webinar',
  'Meetup',
  'Seminar',
  'Training',
  'Other',
];

export const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];
