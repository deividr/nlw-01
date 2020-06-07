import { Request, Response, request } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('points.city', String(city))
      .where('points.uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map((point) => ({
      ...point,
      image_url: `http://192.168.0.11:3333/uploads/${point.image}`,
    }));

    return res.json(serializedPoints);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return res.status(400).json({ message: 'Point not found.' });
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('title');

    point['image_url'] = `http://192.168.0.11:3333/uploads/${point.image}`;

    return res.json({ point, items });
  }

  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      longitude,
      latitude,
      city,
      uf,
      items,
    } = req.body;

    const point = {
      image: req.file ? req.file.filename : 'not-found.png',
      name,
      email,
      whatsapp,
      longitude,
      latitude,
      city,
      uf,
    };

    const trans = await knex.transaction();

    const pointsIds = await trans('points').insert(point);

    const point_id = pointsIds[0];

    const pointItems = items
      .split(',')
      .map((item_id: string) => Number(item_id.trim()))
      .map((item_id: number) => {
        return {
          point_id,
          item_id,
        };
      });

    await trans('point_items').insert(pointItems);

    await trans.commit();

    return res.json({
      ...point,
      id: point_id,
      image_url: `http://192.168.0.11:3333/uploads/${point.image}`,
    });
  }
}

export default PointsController;
