import Airtable from 'airtable';
import Record from 'airtable/lib/record';
import { Records } from 'airtable/lib/records';
import Table from 'airtable/lib/table';

import { config } from '../config';

const base = new Airtable({ apiKey: config.airtableApiKey, }).base(
  config.airtableBaseKEy
);

export type TFieldSet = {
  id: string;
  name: string;
  address: string;
  neighbourhood: string;
  voting: number;
  imgUrl: string;
};

const table: Table<TFieldSet> = base('restaurants');

const getMinifiedRecord = (record: Record<TFieldSet>) => {
  return {
    ...record.fields,
    recordId: record.id,
  };
};

const getMinifiedRecords = (records: Records<TFieldSet>) => {
  return records.map((record) => getMinifiedRecord(record));
};

const findRecordByFilter = async (id: string | number) => {
  const findRestaurantRecords = await table
    .select({
      filterByFormula: `id="${id}"`,
    })
    .firstPage();

  return getMinifiedRecords(findRestaurantRecords);
};

export { table, getMinifiedRecords, findRecordByFilter };
