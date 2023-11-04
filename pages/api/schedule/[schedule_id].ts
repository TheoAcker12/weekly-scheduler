import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { Schedule, itemIncludeClause, schedulePatchSchema } from '@/lib/api_schema';
import { Prisma } from '@prisma/client';

// the expected context provided by the dynamic route
const querySchema = z.object({ _id: z.string() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = parseInt(querySchema.parse(req.query)._id);
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
  await prisma.schedule.delete({ where: { id }});
  return res.status(200).json({message: 'delete success'});
}

async function PATCH(id: number, req: NextApiRequest, res: NextApiResponse) {
  const body = schedulePatchSchema.parse(req.body);
  let data: Prisma.ScheduleUpdateInput;
  switch (body.type) {
    case 'amount':
      data = { amount: body.amount };
      break;
    case 'day':
      data = { [body.day]: body.value };
      break;
    case 'category/add':
      data = { categories: { connect: { id: body.id}} };
      break;
    case 'category/remove':
      data = { categories: { disconnect: { id: body.id}} };
      break;
  }
  const schedule: Schedule = await prisma.schedule.update({
    where: { id },
    data,
    select: itemIncludeClause.schedules.select,
  });
  return res.status(200).json(schedule);
}