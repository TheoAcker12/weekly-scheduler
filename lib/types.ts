import * as z from "zod"
import { Category, Prisma } from "@prisma/client"

// provides important information for pages - used for popuplating navbar
export type Page = {
  route: string, // relative url
  menu: string, // text for the page link in the nav
}
export type GenericError = { id?: string, error?: string, msg?: string }
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6'

// days
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const zDays = z.enum(days);
type Day = z.infer<typeof zDays>


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
