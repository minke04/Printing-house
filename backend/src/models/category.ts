import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [SubCategorySchema]
});

export default mongoose.model('Category', CategorySchema, 'categories');