import * as z from "zod"

// provides important information for pages - used for popuplating navbar
export type Page = {
  route: string, // relative url
  menu: string, // text for the page link in the nav
}
export type GenericError = { id?: string, error?: string, msg?: string }
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6'

// days
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const zDays = z.enum(days);
export type Day = z.infer<typeof zDays>

type DayMap<Value> = {
  [day in Day]: Value
}
export function dayKeys<Type>(value: Type): DayMap<Type> {
  return {
    Monday: value,
    Tuesday: value,
    Wednesday: value,
    Thursday: value,
    Friday: value,
    Saturday: value,
    Sunday: value,
  }
}

export type Param = string | string[] | undefined;

// weekly schedule viewer
export type Filter = {
  include: boolean,
  cat_index: number,
  field_index_list: number[],
}

// break down sorted data into various components that build up the whole so that it is easier to work modularly with the data
export type ScheduledItem = {
  name: string,
  amount: string,
  notes?: string | null,
}
// the set of items for a single category
type SortedItemList = {
  name: string,
  items: ScheduledItem[],
}
export type SortedScheduleData = DayMap<SortedItemList[]>
export type UnsortedScheduleData = DayMap<ScheduledItem[]>
export type ScheduleData =
| { sorted: true, dayMap: SortedScheduleData}
| { sorted:false, dayMap: UnsortedScheduleData}