import mongoose from 'mongoose';

const OrderShema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  clientUsername: { type: String, required: true },
  printerId: { type: String, required: true },
  printerName: { type: String, required: true },
  city: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      printType: { type: String },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['naruceno', 'placeno', 'u stampi', 'isporuceno', 'primljeno'], 
    default: 'naruceno' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order',OrderShema,'orders');