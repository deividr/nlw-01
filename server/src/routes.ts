import express from 'express';

import itemsRoutes from './routers/items';
import itemsPoints from './routers/points';

const routes = express.Router();

routes.use(itemsRoutes);
routes.use(itemsPoints);

export default routes;
