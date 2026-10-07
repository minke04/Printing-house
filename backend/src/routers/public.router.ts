import express from 'express';
import { PublicController } from '../controllers/public.controller';

const publicRouter = express.Router();

publicRouter.route('/total-printers').get((req,res) => new PublicController().getTotalPrinters(req,res));
publicRouter.route('/top-products').get((req, res) => new PublicController().getTopProducts(req,res));
publicRouter.route('/active-categories').get((req,res) => new PublicController().getActiveCategories(req,res));
publicRouter.route('/search-products').get((req, res) => new PublicController().searchProducts(req,res));
publicRouter.route('/product-details/:id').get((req, res) => new PublicController().getProductDetails(req, res));

export default publicRouter;