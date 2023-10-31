import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Field, fieldPatchSchema } from '@/lib/api_schema';

// the expected context provided by the dynamic route
const querySchema = z.object({ field_id: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = parseInt(querySchema.parse(req.query).field_id);
    if (isNaN(id)) return res.status(422).json({message: 'Invalid ID'});

    switch (req.method) {
      case 'DELETE': return DELETE(id, res);
      case 'PATCH': return PATCH(id, req, res);
    }

  } catch (e) {
    if (e instanceof z.ZodError) return res.status(422).json(e.issues);
    return res.status(500).json({message: 'Something went wrong', error: e});
  }
  return res.status(500).json({message: 'Request method not handled'});
}

async function DELETE(id: number, res: NextApiResponse) {
  await prisma.field.delete({ where: { id }});
  return res.status(204).json({message: 'delete success'});
}

async function PATCH(id: number, req: NextApiRequest, res: NextApiResponse) {
  const body = fieldPatchSchema.parse(req.body);

  const field: Field = await prisma.field.update({
    where: { id },
    data: body
  })

  return res.status(200).json(field);
}