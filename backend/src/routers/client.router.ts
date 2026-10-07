import express from 'express';
import { ClientController } from '../controllers/client.controller';

const clientRouter = express.Router();

clientRouter.route('/get-profile/:username').get((req, res) => new ClientController().getProfile(req, res));
clientRouter.route('/categories').get((req, res) => new ClientController().getCategories(req, res));
clientRouter.route('/update-profile').post((req, res) => new ClientController().updateProfile(req, res));
clientRouter.route('/get-orders/:username').get((req, res) => new ClientController().getClientOrders(req, res));
clientRouter.route('/cancel-order').post((req, res) => new ClientController().cancelOrder(req, res));
clientRouter.route('/search-products').get((req, res) => new ClientController().searchProducts(req, res));
clientRouter.route('/product-details/:id').get((req, res) => new ClientController().getProductDetails(req,res));
clientRouter.route('/create-orders').post((req, res) => new ClientController().createOrders(req,res));
clientRouter.route('/create-public-procurement').post((req, res) => new ClientController().createPublicProcurement(req,res));
clientRouter.route('/mark-received').post((req, res) => new ClientController().markOrderAsReceived(req, res));
clientRouter.route('/rate-comment').post((req, res) => new ClientController().rateOrCommentProduct(req, res));
clientRouter.route('/get-public-procurements/:username').get((req, res) => new ClientController().getPublicProcurements(req, res));
clientRouter.route('/client-archive/:username').get((req, res) => new ClientController().getClientArchive(req, res));

export default clientRouter;