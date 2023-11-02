/**
 * Handles data, state, and what general components should be shown. Does not concern itself with the display or format of the data.
 */

import SortAndFilterForm from "@/components/sort-and-filter/SortAndFilterForm"
import CustomLink from "@/components/ui/CustomLink"
import { Select } from "@/components/ui/Select"
import { days } from "@/lib/types"
import styles from '@/styles/pages/schedules.module.scss'
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useImmerReducer } from "use-immer"
import { ScheduleAction, ScheduleState, scheduleReducer } from "./schedule-reducer"
import { getStartDayIndex } from "@/lib/utils"
import Loading from "@/components/ui/Loading"

export default function WeeklyScheduleWrapper() {
  const router = useRouter();
  const [state, dispatch] = useImmerReducer<ScheduleState, ScheduleAction>(scheduleReducer, {
    status: 'routerLoading',
    viewType: 'list',
    startDayIndex: getStartDayIndex(process.env.NEXT_PUBLIC_DEFAULT_WEEK_START) ?? 0,
  });

  // wait until router is ready before doing anythingconst router = useRouter();
  useEffect(()=>{
    console.log('router not ready');
    if(!router.isReady) return;
    // inform reducer that router is ready and provide router query params
    console.log(router.query);
    dispatch({type: 'routerReady', params: router.query})
  }, [router.isReady]);
  if (state.status === 'routerLoading') return <Loading />


  return (
    <div>
      <div className={styles.viewOptions}>
        <Select
          id='view-select'
          labelText='View as '
          onChange={(e) => dispatch({type: 'viewTypeSelected', value: e.target.value === 'list' ? 'list' : 'table'})}
          value={state.viewType}
        >
          <option value='list'>List</option>
          <option value='table'>Table</option>
        </Select>
        <Select
          id='start-day-select'
          labelText='Start week at '
          onChange={(e) => dispatch({type: 'startDaySelected', value: parseInt(e.target.value)})}
          value={state.startDayIndex}
        >
          {days.map((day, index) => <option key={day} value={index}>{day}</option>)}
        </Select>
        <CustomLink
          href={{pathname: '/print-layout', query: {
            view_as: state.viewType,
            start_on: days[state.startDayIndex],
          }}}
          target='_blank'
          hiddenText=" Opens in new tab"
        >
          <span>Open print layout</span>
        </CustomLink>
      </div>
        <SortAndFilterForm
          params={{
            view_as: state.viewType,
            start_on: days[state.startDayIndex],
          }}
        />
    </div>
  )
}