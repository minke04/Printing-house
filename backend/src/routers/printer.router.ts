import express from 'express';
import { PrinterController } from '../controllers/printer.controller';
import multer from 'multer';
import path from 'path';

const printerRouter = express.Router();

// Podešavanje multer skladišta za proizvode
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
      return cb(new Error('Samo su slike dozvoljene!'));
    }
    cb(null, true);
  }
});

printerRouter.route('/get-profile/:username').get((req, res) => new PrinterController().getProfile(req, res));
printerRouter.route('/update-profile').post((req, res) => new PrinterController().updateProfile(req, res));

printerRouter.route('/add-product').post(upload.single('imageUrl'), (req, res) => new PrinterController().addProduct(req, res));

printerRouter.route('/update-stock').post((req, res) => new PrinterController().updateStock(req, res));
printerRouter.route('/products/:printerId').get((req, res) => new PrinterController().getProductsByPrinter(req, res));
printerRouter.route('/import-json').post((req, res) => new PrinterController().importProductsFromJson(req, res));
printerRouter.route('/orders/status').post((req, res) => new PrinterController().updateOrderStatus(req, res));
printerRouter.route('/orders/:printerId').get((req, res) => new PrinterController().getOrdersByPrinter(req, res));
printerRouter.route('/public-procurements/open').get((req, res) => new PrinterController().getActiveProcurements(req, res));
printerRouter.route('/public-procurements/:procurementId/bid').post((req, res) => new PrinterController().submitBid(req, res));

export default printerRouter;