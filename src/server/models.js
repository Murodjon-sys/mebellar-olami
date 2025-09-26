import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image_url: { type: String, default: '' },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    // Internal flag used to mark demo seeded data
    _seed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'delivered'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    cardNumber: { type: String },
    trackingNumber: String,
    adminNotes: String,
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    // Admin panel fields
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, default: 'new' },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);


