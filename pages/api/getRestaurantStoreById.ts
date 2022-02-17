// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { findRecordByFilter, TFieldSet } from '../../lib/airtable';

type Data = TFieldSet[] | {
  message?: string;
  err?: string;
};

const getRestaurantStoreById = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const { id, } = req.query;

  try {
    if (id) {
      const records = await findRecordByFilter(id as string);

      if (records.length !== 0) {
        res.json(records);
      } else {
        res.json({ message: 'id could not be found', });
      }
    } else {
      res.status(400);
      res.json({ message: 'Id is missing', });
    }
  } catch (error) {
    res.status(500);
    const msg = (error as Error).message;

    res.json({
      message: 'Something went wrong',
      err: msg,
    });
  }
};

export default getRestaurantStoreById;
