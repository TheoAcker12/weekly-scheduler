import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Category, categorySelectClause, newCategorySchema } from '@/lib/api_schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': return GET(res);
      case 'POST': return POST(req, res);
    }

  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json(e.issues);
    return res.status(500).json({message: 'Something went wrong', error: e});
  }
  return res.status(500).json({message: 'Request method not handled'});
}

async function GET(res: NextApiResponse) {
  const categories: Category[] = await prisma.category.findMany({
    select: categorySelectClause,
  })
  return res.status(200).json(categories);
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = newCategorySchema.parse(req.body);
  // set field order based on index
  const fields = body.fields.map((field, index) => ({...field, order: index}));

  const category: Category = await prisma.category.create({
    data: {
      name: body.name,
      fields: { create: fields }
    },
    select: categorySelectClause,
  })

  return res.status(200).json(category);
}