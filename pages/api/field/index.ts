import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Field, moveSchema, newFieldSchema } from '@/lib/api_schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': return POST(req, res);
      case 'PATCH': return PATCH(req, res);
    }

  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json(e.issues);
    return res.status(500).json({message: 'Something went wrong', error: e});
  }
  return res.status(500).json({message: 'Request method not handled'});
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = newFieldSchema.parse(req.body);
  const field: Field = await prisma.field.create({
    data: body,
    select: { id: true, name: true, order: true },
  })
  return res.status(200).json(field);
}

async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const body = moveSchema.parse(req.body);
  for (let field of body) {
    await prisma.field.update({
      where: { id: field.id },
      data: { order: field.order },
    })
  }
  // return generic success message
  return res.status(200).json({message: 'reorder success'});
}