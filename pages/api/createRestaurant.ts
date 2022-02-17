// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  table,
  getMinifiedRecords,
  findRecordByFilter,
  TFieldSet
} from '../../lib/airtable';

type Data = TFieldSet[] | {
  message?: string;
  err?: string;
};

const createRestaurant = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'POST') {
    //find a record

    const { id, name, neighbourhood, address, imgUrl, voting, } = req.body;

    try {
      if (id) {
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          res.json(records);
        } else {
          //create a record
          if (name) {
            const createRecords = await table.create([
              {
                fields: {
                  id,
                  name,
                  address,
                  neighbourhood,
                  voting,
                  imgUrl,
                },
              }
            ]);

            const records = getMinifiedRecords(createRecords);
            res.json(records);
          } else {
            res.status(400);
            res.json({ message: 'Id or name is missing', });
          }
        }
      } else {
        res.status(400);
        res.json({ message: 'Id is missing', });
      }
    } catch (err) {
      console.error('Error creating or finding a store', err);
      res.status(500);

      const msg = (err as Error).message;

      res.json({
        message: 'Error creating or finding a store',
        err: msg,
      });
    }
  }
};

export default createRestaurant;
