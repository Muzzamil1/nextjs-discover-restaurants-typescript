// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchRestaurants, IRestaurant } from '../../lib/restaurants';

type Data = IRestaurant[] | {
  message: string;
  err: string
}

const getRestaurantsByLocation = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  try {
    const { latLong, limit, } = req.query;
    const response = await fetchRestaurants(latLong as string, Number(limit));
    res.status(200);
    res.json(response);
  } catch (error) {
    console.error('There is an error', error);
    res.status(500);
    const msg = (error as Error).message;

    res.json({
      message: 'Oh no! Something went wrong',
      err: msg,
    });
  }
};

export default getRestaurantsByLocation;
