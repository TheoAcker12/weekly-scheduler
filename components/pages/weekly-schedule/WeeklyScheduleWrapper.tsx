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
import { formatData, getStartDayIndex } from "@/lib/utils"
import Loading from "@/components/ui/Loading"
import * as z from "zod";
import { categorySchema, scheduleListItemSchema } from "@/lib/api_schema"
import Alert from "@/components/ui/Alert"
import WeeklyScheduleList from "./WeeklyScheduleList"

type Props = {
  listOnly?: boolean,
}

export default function WeeklyScheduleWrapper(props: Props) {
  const router = useRouter();
  const [state, dispatch] = useImmerReducer<ScheduleState, ScheduleAction>(scheduleReducer, {
    status: 'routerLoading',
    viewType: 'list',
    startDayIndex: getStartDayIndex(process.env.NEXT_PUBLIC_DEFAULT_WEEK_START) ?? 0,
    params: {}, // router not ready yet, so can't provide anything but an empty object
  });

  // update state when router is ready so search params can be checked
  useEffect(()=>{
    if(!router.isReady) return;
    // inform reducer that router is ready and provide router query params
    dispatch({type: 'routerReady', params: router.query})
  }, [router.isReady]);

  // check if search params have changed such that data needs to be modified (though only bother checking when the router is ready - pointless otherwise)
  if (router.isReady) { for (let param of ['include', 'exclude', 'sort_by']) {
    if (state.params[param] !== router.query[param]) {
      dispatch({type: 'paramsModified', params: router.query});
      continue;
    }
  }}

  const getData = async () => {
    try {
      if (!state.categories) {
        const res = await fetch('/api/category', {
          method: 'GET',
        });
        if (!res.ok) {
          // failed to load data - don't keep trying
          dispatch({type: 'dataLoadFailed', error: {msg: 'Category data failed to load. Server responded with status:' + res.status + ', ' + res.statusText}});
          return;
        }
        const body = await res.json();
        const categories = z.array(categorySchema).parse(body);
        dispatch({type: 'categoriesLoaded', categories});
      }
      if (state.categories && !state.data) {
        const res = await fetch ('/api/schedule', {
          method: 'GET',
        });
        if (!res.ok) {
          // failed to load data - don't keep trying
          dispatch({type: 'dataLoadFailed', error: {msg: 'Schedule data failed to load. Server responsed with status:' + res.status + ', ' + res.statusText}});
          return;
        }
        const body = await res.json();
        const schedules = z.array(scheduleListItemSchema).parse(body);
        // turn schedules into necessary data, then dispatch
        const data = formatData(state.categories, schedules, router.query);
        dispatch({type: 'dataLoaded', data});
      }
    } catch (e) {
      if (e instanceof Error) dispatch ({type: 'dataLoadFailed', error: {msg: e.message}});
      else dispatch({type: 'dataLoadFailed', error: {msg: 'An unknown error occured when trying to load data.'}});
    }
  }
  
  // wait until router is ready before doing anything
  if (state.status === 'routerLoading') return <Loading />
  // also wait for data to load
  if (state.status === 'dataLoading') {
    getData();
    return <Loading />
  }
  // display errors if necessary
  if (!state.categories || !state.data) return <Alert errors={[state.error ?? {msg: 'An unidentified error occured.'}]} />

  // for convenience
  const scheduleList = <WeeklyScheduleList
    data={state.data}
    viewType={state.viewType}
    startDayIndex={state.startDayIndex}
  />

  if (props.listOnly) return scheduleList;

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
            ...state.params,
            view_as: state.viewType,
            start_on: days[state.startDayIndex],
          }}}
          target='_blank'
          hiddenText=" Opens in new tab"
        >
          <span>Open print layout</span>
        </CustomLink>
      </div>
      {/* No sort and filter options if no categories exist */}
      { state.categories.length > 0 ?
          <SortAndFilterForm
            params={{
              ...router.query,
              view_as: state.viewType,
              start_on: days[state.startDayIndex],
            }}
            categories={state.categories}
          />
        : 'Add categories to get sort and filter options.'}
        {scheduleList}
    </div>
  )
}