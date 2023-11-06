import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'
import { dayKeys } from '@/lib/types';
import { Schedule, ScheduleListItem, itemIncludeClause, newScheduleSchema } from '@/lib/api_schema';

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
  const schedules: ScheduleListItem[] = await prisma.schedule.findMany({
    select: {
      amount: true,
      item: { select: {
        name: true, notes: true,
      }},
      categories: { select: {
        id: true, cat_id: true,
      }},
      ...dayKeys<boolean>(true)
    },
    orderBy: { item: { order: 'asc' }},
  });
  return res.status(200).json(schedules);
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = newScheduleSchema.parse(req.body);
  // because item_id is passed in, the connect to the appropriate Item should be made without needing to specify that connection here
  const schedule: Schedule = await prisma.schedule.create({
    data: {
      ...body,
    },
    select: itemIncludeClause.schedules.select,
  });
  return res.status(200).json(schedule);
}