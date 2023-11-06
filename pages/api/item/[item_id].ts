import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Prisma } from '@prisma/client';
import { Item, itemIncludeClause, itemPatchSchema } from '@/lib/api_schema';

// the expected context provided by the dynamic route
const querySchema = z.object({ item_id: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = parseInt(querySchema.parse(req.query).item_id);
    if (isNaN(id)) return res.status(422).json({message: 'Invalid ID'});

    switch (req.method) {
      case 'GET': return GET(id, res);
      case 'DELETE': return DELETE(id, res);
      case 'PATCH': return PATCH(id, req, res);
    }

  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json(e.issues);
    return res.status(500).json({message: 'Something went wrong', error: e});
  }
  return res.status(500).json({message: 'Request method not handled'});
}

async function GET(id: number, res: NextApiResponse) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: itemIncludeClause,
  })
  return res.status(200).json(item);
}

async function DELETE(id: number, res: NextApiResponse) {
  await prisma.item.delete({ where: { id }});
  return res.status(200).json({message: 'delete success'});
}

async function PATCH(id: number, req: NextApiRequest, res: NextApiResponse) {
  const body = itemPatchSchema.parse(req.body);
  let data: Prisma.ItemUpdateInput;
  let categoriesClause: {connect: {id: number}}|{disconnect: {id: number}}|undefined;
  switch (body.type) {
    case 'name':
      data = { name: body.name };
      break;
    case 'notes':
      data = { notes: body.notes };
      break;
    case 'category/add':
      categoriesClause = { connect: { id: body.id}};
      data = { categories: categoriesClause };
      break;
    case 'category/remove':
      categoriesClause = { disconnect: { id: body.id}};
      data = { categories: categoriesClause };
      break;
  }
  const item: Item = await prisma.item.update({
    where: { id },
    data,
    include: itemIncludeClause,
  })
  // for adding/removing categories: update all of the item's schedules, too
  if (categoriesClause) {
    const ids = (await prisma.schedule.findMany({
      where: { item_id: id },
      select: { id: true }
    })).map((value) => value.id);
    for (let schedule_id of ids) {
      await prisma.schedule.update({
        where: { id: schedule_id },
        data: { categories: categoriesClause }
      });
    }
  }
  return res.status(200).json(item);
}