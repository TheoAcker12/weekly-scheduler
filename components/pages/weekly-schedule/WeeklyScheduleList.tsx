import { ScheduleData, ScheduledItem, days } from '@/lib/types'
import { getOrderedDays } from '@/lib/utils'
import styles from '@/styles/pages/schedules.module.scss'
import { AiOutlineBorder } from 'react-icons/ai'

type Props = {
  data: ScheduleData,
  viewType: 'list' | 'table',
  startDayIndex: number,
}

// turn a set of items into a list (which will go under day for unsorted data or a category under day for sorted data)
function buildScheduledItemList(items: ScheduledItem[]): JSX.Element {
  if (items.length === 0) return <span>Nothing</span>
  return (<ul className={"list-unstyled " + styles.itemList}>
    {items.map((item, index) =>
      <li key={index} className={styles.scheduledItem}>
        <AiOutlineBorder />
        <span>
          <span className="item-info">{item.name}: {item.amount}</span>
          {item.notes ? <span className={styles.itemNotes}> ({item.notes})</span> : ''}
        </span>
      </li>
    )}
  </ul>)
}

export default function WeeklyScheduleList({data, ...props}: Props) {
  // for sorted data, get category headers
  let sortedHeaders: string[] = [];
  if (data.sorted) {
    sortedHeaders = data.dayMap["Friday"].map((group) => group.name);
  }

  // rows for sorted styles
  // first get text defining how that should look
  let gridRowText = '[day-headers] min-content';
  // gridRowText = gridRowText + ' [day-content] min-content';
  if (!(data.sorted)) gridRowText = //`${gridRowText} '[day-content] min-content'`
  gridRowText + ' [day-content] min-content';
  else {
    // add variable number of rows based on categories
    gridRowText = gridRowText + ' ' + sortedHeaders.map((key) => `[${key}-header] min-content [${key}-content] min-content`).join(' ');
  }

  // simplify checking view type
  const listView = props.viewType === 'list';
  return (
    <div className={(listView ? 'list ' + styles.scheduleList : "grid " + styles.scheduleGrid)} style={{gridTemplateRows: gridRowText}}>
      {/* These headers are ignored by assistive tech, as the necessary information is provided at more sensible locations elsewhere */}
      <div className={"ignore-grid" + (listView ? ' hidden' : '')} aria-hidden="true">
        {days.map((day) => <div key={day} className="grid-header">{day}</div>)}
        {/* also placing visual category headers (for sorted data) here */}
        {sortedHeaders.map((cat) => <div key={cat} className={styles.sortedHeader} style={{gridRow: cat + '-header'}}>{cat}</div>)}
      </div>
      {/* map content to each day - use correct starting day as set by user */}
      {getOrderedDays(props.startDayIndex).map((day) =>
        <div className="ignore-grid" key={day}>
          <h2 className={listView ? styles.listHeader : 'sr-only'}>{day}</h2>
          {/* temporarily ignoring sorted data for initial setup */}
          {data.sorted ? data.dayMap[day].map((group) =>
            <div key={group.name} className={`list-col-${day} ${styles.listContent}`} style={{gridRow: `${group.name}-content`}}>
              <h3 className={listView ? '' : 'sr-only'}>{group.name}</h3>
              {buildScheduledItemList(group.items)}
            </div>
          )
          : buildScheduledItemList(data.dayMap[day])}
        </div>
      )}
    </div>
  )
}