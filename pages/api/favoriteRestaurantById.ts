// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  TFieldSet,
  table,
  findRecordByFilter,
  getMinifiedRecords
} from '../../lib/airtable';

type Data =
  | TFieldSet[]
  | {
    message?: string;
    err?: string;
    id?: string;
  };

const favoriteRestaurantById = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'PUT') {
    try {
      const { id, } = req.body;

      if (id) {
        const records = await findRecordByFilter(id);

        if (records.length !== 0) {
          const record = records[0];

          const calculateVoting = Number(record.voting ?? 0) + 1;

          const updateRecord = await table.update([
            {
              id: record.recordId,
              fields: {
                voting: calculateVoting,
              },
            }
          ]);

          if (updateRecord) {
            const minifiedRecords = getMinifiedRecords(updateRecord);
            res.json(minifiedRecords);
          }
        } else {
          res.json({
            message: 'Restaurant id doesn\'t exist',
            id,
          });
        }
      } else {
        res.status(400);
        res.json({ message: 'Id is missing', });
      }
    } catch (error) {
      res.status(500);

      const msg = (error as Error).message;

      res.json({
        message: 'Error up voting Restaurant',
        err: msg,
      });
    }
  }
};

export default favoriteRestaurantById;
