import { Router } from 'express';
import PointsController from '../controllers/PointsController';
import multer from 'multer';
import storage from '../config/multer';
import path from 'path';
import { celebrate, Joi } from 'celebrate';

const uploads = multer({
  storage,
  fileFilter: (request, file, callback) => {
    const extensionFile = path.extname(file.originalname);

    if (
      extensionFile !== '.jpg' &&
      extensionFile !== '.jpeg' &&
      extensionFile !== '.png' &&
      extensionFile !== '.gif'
    ) {
      return callback(null, false);
    }
    callback(null, true);
  },
});

const routes = Router();
const pointsController = new PointsController();

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

routes.post(
  '/points',
  uploads.single('image'),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        whatsapp: Joi.number().required(),
        longitude: Joi.number().required(),
        latitude: Joi.number().required(),
        uf: Joi.string().max(2).required(),
        city: Joi.string().required(),
        items: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  pointsController.create
);

export default routes;
