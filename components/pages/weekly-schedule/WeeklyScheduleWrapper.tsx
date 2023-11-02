/**
 * Handles data, state, and what general components should be shown. Does not concern itself with the display or format of the data.
 */

import SortAndFilterForm from "@/components/sort-and-filter/SortAndFilterForm"
import CustomLink from "@/components/ui/CustomLink"
import { Select } from "@/components/ui/Select"
import { days } from "@/lib/types"
import styles from '@/styles/pages/schedules.module.scss'

export default function WeeklyScheduleWrapper() {
  return (
    <div>
      <div className={styles.viewOptions}>
        <Select
          id='view-select'
          labelText='View as '
        >
          <option value='list'>List</option>
          <option value='table'>Table</option>
        </Select>
        <Select
          id='start-day-select'
          labelText='Start week at '
        >
          {days.map((day, index) => <option key={day} value={index}>{day}</option>)}
        </Select>
        <CustomLink
          href={{pathname: '/print-layout'}}
          target='_blank'
          hiddenText=" Opens in new tab"
        >
          <span>Open print layout</span>
        </CustomLink>
      </div>
        <SortAndFilterForm
        />
    </div>
  )
}