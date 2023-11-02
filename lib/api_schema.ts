import { Prisma } from '@prisma/client';
import * as z from 'zod'
import { dayKeys, zDays } from './types';

// Category
// returns categorySchema defined below
export const categorySelectClause = {
  id: true, name: true,
  fields: {
    select: { name: true, id: true, order: true },
    orderBy: { order: Prisma.SortOrder.asc }
  }
};

// GET /category
// response: array of these:
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  fields: z.array(z.object({
    id: z.number(),
    name: z.string(),
    order: z.number(),
  }))
});
export type Category = z.infer<typeof categorySchema>

// POST /category
// request:
export const newCategorySchema = z.object({
  name: z.string().trim(),
  fields: z.array(z.object({
    name: z.string().trim(),
  }))
});
// response: categorySchema (above)

// GET /category/id
// response: categorySchema (above)

// PATCH /category/id
// request: (can update name)
export const categoryPatchSchema = z.object({ name: z.string().trim() });
// response: categorySchema (above)

// DELETE /category/id
// request/response: n/a


// Field

// POST /field
// request:
export const newFieldSchema = z.object({
  name: z.string().trim(),
  order: z.number(),
  cat_id: z.number(),
});
// response:
const fieldSchema = z.object({
  id: z.number(),
  name: z.string().trim(),
  order: z.number(),
});
export type Field = z.infer<typeof fieldSchema>

// PATCH /field
// request: (change order of multiple fields)
export const moveSchema = z.array(z.object({ id: z.number(), order: z.number() }));
// response: n/a

// PATCH /field/id
// request: (update name)
export const fieldPatchSchema = z.object({ name: z.string().trim() });
// response: fieldSchema (above)

// DELETE /field/id
// request/response: n/a



// Schedule
export const scheduleDays = z.object({
  Monday: z.boolean(),
  Tuesday: z.boolean(),
  Wednesday: z.boolean(),
  Thursday: z.boolean(),
  Friday: z.boolean(),
  Saturday: z.boolean(),
  Sunday: z.boolean(),
})

// GET /schedule
// response: array of these:
export const scheduleListItemSchema = z.object({
  amount: z.string(),
  item: z.object({ name: z.string(), notes: z.string().nullish() }),
  categories: z.array(z.object({
    id: z.number(),
    cat_id: z.number(),
  }))
}).merge(scheduleDays)
export type ScheduleListItem = z.infer<typeof scheduleListItemSchema>

// POST /schedule
// request:
export const newScheduleSchema = z.object({
  item_id: z.number(),
  amount: z.string().trim(),
  categories: z.array(z.object({ id: z.number() })),
}).merge(scheduleDays);
// response:
const scheduleSchema = z.object({
  id: z.number(),
  amount: z.string(),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    category: z.object({ name: z.string() }),
  }))
}).merge(scheduleDays);
export type Schedule = z.infer<typeof scheduleSchema>

// PATCH /schedule/id
// request: edit amount, add or remove category, toggle day
export const schedulePatchSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('amount'), amount: z.string().trim()}),
  z.object({type: z.literal('category/add'), id: z.number()}),
  z.object({type: z.literal('category/remove'), id: z.number()}),
  z.object({type: z.literal('day'), day: zDays, value: z.boolean()}),
]);
// response: scheduleSchema (above)

// DELETE /schedule/id
// request/response: n/a


// Item
// returns itemSchema defined further below
const categoriesSelect = { select: {
  id: true, name: true,
  category: { select: { name: true }},
}}
export const itemIncludeClause = {
  categories: categoriesSelect,
  schedules: { select: {
    id: true, amount: true,
    categories: categoriesSelect,
    ...dayKeys<boolean>(true),
  }}
}

// GET /item
// response: array of these:
const listItemSchedule = z.object({
  amount: z.string(),
  categories: z.array(z.object({ name: z.string() })),
}).merge(scheduleDays);
export const itemListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  notes: z.string().nullish(),
  order: z.number(),
  categories: z.array(z.object({ name: z.string() })),
  schedules: z.array(listItemSchedule)
})
export type ItemListItem = z.infer<typeof itemListItemSchema>
export type ListItemSchedule = z.infer<typeof listItemSchedule>

// POST /item
// request:
export const newItemSchema = z.object({
  name: z.string().trim(),
  notes: z.string().trim().nullish(),
  order: z.number(),
  categories: z.array(z.object({ id: z.number() })),
  schedules: z.array(z.object({
    amount: z.string().trim(),
    categories: z.array(z.object({ id: z.number() })),
  }).merge(scheduleDays))
})
// response:
const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  notes: z.string().nullish(),
  order: z.number(),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    category: z.object({ name: z.string() }),
  })),
  schedules: z.array(scheduleSchema),
})
export type Item = z.infer<typeof itemSchema>

// PATCH /item
// request: (change order of multiple items) - use moveSchema (above - defined for PATCH /fields)
// response: n/a

// GET /item/id
// response: itemSchema (above)

// PATCH /item/id
// request: edit name, edit notes, add/remove category
export const itemPatchSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('name'), name: z.string().trim()}),
  z.object({type: z.literal('notes'), notes: z.string().trim().optional()}),
  z.object({type: z.literal('category/add'), id: z.number()}),
  z.object({type: z.literal('category/remove'), id: z.number()}),
])
// response: itemSchema (above)

// DELETE /item/id
// request/response: n/a


