import type { NextApiRequest, NextApiResponse } from "next";

import camelcaseKeys from "camelcase-keys";

import { getClient } from "src/database";

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

type MyQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: string;
  sort: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = getClient();
  const { page, pageSize, search, field, sort } =
    req.query as unknown as MyQuery;
  try {
    await client.connect();
    const result = await client.query(`
        select
            count(*) over() as full_count,
            t1.*,
            t2.address_1,
            t2.city,
            t2.state,
            t2.zip_code,
            t3.name as company_name
        from loan t1
        left join address t2
            on t1.address_id = t2.id
        left join company t3
            on t1.company_id = t3.id
        where t3.name ilike '%${search}%'
        order 
            by ${camelToSnakeCase(field)} ${sort.toUpperCase()}
        limit 
            ${pageSize}
        offset 
            ${page * pageSize}
        `);

    res
      .status(200)
      .json([
        camelcaseKeys(result.rows),
        parseInt(result.rows?.[0]?.full_count),
      ]);
  } catch (err: any) {
    console.log(err);
    res.status(500).send(err.message);
  } finally {
    await client.end();
  }
}
