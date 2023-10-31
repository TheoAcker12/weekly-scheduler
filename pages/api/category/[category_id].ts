import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Category, categoryPatchSchema, categorySelectClause } from '@/lib/api_schema';

// the expected context provided by the dynamic route
const querySchema = z.object({ category_id: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = parseInt(querySchema.parse(req.query).category_id);
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
  const category: Category|null = await prisma.category.findUnique({
    where: { id },
    select: categorySelectClause,
  })
  if (!category) return res.status(404).json({message: 'No category with that ID exists'});
  return res.status(200).json(category);
}

async function DELETE(id: number, res: NextApiResponse) {
  // relation uses onDelete: Cascade, so deleting category should automatically delete all related fields
  await prisma.category.delete({
    where: { id }
  })
  // throws exception if record did not exist, so if we make it here we can safely return a successful result
  return res.status(204).json({message: 'delete success'});
}

async function PATCH(id: number, req: NextApiRequest, res: NextApiResponse) {
  const body = categoryPatchSchema.parse(req.body);

  const category: Category = await prisma.category.update({
    where: { id },
    data: body,
    select: categorySelectClause,
  })

  return res.status(200).json(category);
}