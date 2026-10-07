import express from 'express';
import { CategoryController } from '../controllers/category.controller';

const categoryRouter = express.Router();

categoryRouter.route('/get-categories').get((req, res) => new CategoryController().getCategories(req, res));
categoryRouter.route('/add-category').post((req, res) => new CategoryController().addCategory(req, res));
categoryRouter.route('/add-subcategory').post((req, res) => new CategoryController().addSubcategory(req, res));

export default categoryRouter;