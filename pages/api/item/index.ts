import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Item, ItemListItem, itemIncludeClause, moveSchema, newItemSchema } from '@/lib/api_schema';
import { dayKeys } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': return GET(res);
      case 'POST': return POST(req, res);
      case 'PATCH': return PATCH(req, res);
    }

  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json(e.issues);
    return res.status(500).json({message: 'Something went wrong', error: e});
  }
  return res.status(500).json({message: 'Request method not handled'});
}

async function GET(res: NextApiResponse) {
  const items: ItemListItem[] = await prisma.item.findMany({
    include: {
      categories: { select: { name: true }},
      schedules: { select: {
        amount: true,
        categories: { select: { name: true }},
        ...dayKeys<boolean>(true),
      }}
    },
    orderBy: { order: 'asc' }
  })
  return res.status(200).json(items);
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = newItemSchema.parse(req.body);
  const item: Item = await prisma.item.create({
    data: {
      ...body,
      categories: {
        connect: body.categories,
      },
      schedules: {
        // createMany might be more efficient, but you can't access relations within createMany, and the shcedules need to be connected to categories (potentially)
        create: body.schedules.map((s) => ({...s, categories: { connect: s.categories }})),
      },
    },
    include: itemIncludeClause
  })
  return res.status(200).json(item);
}

async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const body = moveSchema.parse(req.body);
  for (let item of body) {
    await prisma.item.update({
      where: { id: item.id },
      data: { order: item.order },
    })
  }
  // return generic success message
  return res.status(200).json({message: 'reorder success'});
}