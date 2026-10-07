import express from 'express';
import { UserController } from '../controllers/user.controller';
import multer from 'multer';
import path from 'path';

const userRouter = express.Router();

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
      return cb(new Error('Samo su slike pozvoljene!'));
    }
    cb(null, true);
  }
});

userRouter.route('/login').post((req, res) => new UserController().login(req, res));
userRouter.route('/admin-login').post((req, res) => new UserController().adminLogin(req, res));

userRouter.route('/register').post(upload.single('profileImage'), (req, res) => new UserController().register(req, res));

userRouter.route('/forgot-password').post((req, res) => new UserController().forgotPassword(req, res));
userRouter.route('/reset-password/:token').post((req, res) => new UserController().resetPassword(req, res));
userRouter.route('/pending-users').get((req, res) => new UserController().getPendingUsers(req, res));
userRouter.route('/approve-user').post((req, res) => new UserController().approveUser(req, res));
userRouter.route('/reject-user').post((req, res) => new UserController().rejectUser(req, res));
userRouter.route('/all-users').get((req, res) => new UserController().getAllUsers(req, res));
userRouter.route('/update-user').post((req, res) => new UserController().updateUserByAdmin(req, res));
userRouter.route('/delete-user').post((req, res) => new UserController().deleteUserByAdmin(req, res));

export default userRouter;