/*import mongoose from 'mongoose';

const PrintServiceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  printType: { type: String, required: true },
  additionalPricePerPiece: { type: Number, required: true },
  maxWidthMm: { type: Number, required: true },
  maxHeightMm: { type: Number, required: true }
});

const ProductSchema = new mongoose.Schema({
  printerId: { type: String, required: true },
  printerName: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  availableColors: [String],
  imageUrl: { type: String, default: '' },
  additionalImages: [String],
  printServices: [PrintServiceSchema],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
});

export default mongoose.model('Product', ProductSchema, 'products');*/

import mongoose from 'mongoose';

const PrintServiceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  printType: { type: String, required: true },
  additionalPricePerPiece: { type: Number, required: true },
  maxWidthMm: { type: Number, required: true },
  maxHeightMm: { type: Number, required: true }
});

const CommentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, default: Date.now },
  text: { type: String, required: true }
});

const ProductSchema = new mongoose.Schema({
  printerId: { type: String, required: true },
  printerName: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  availableColors: [String],
  imageUrl: { type: String, default: '' },
  additionalImages: [String],
  printServices: [PrintServiceSchema],
  likesCount: { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 },
  comments: [CommentSchema]
});

export default mongoose.model('Product', ProductSchema, 'products');