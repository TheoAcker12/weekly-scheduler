import { Button } from "@/components/ui/Button";
import { GridAction, GridState } from "./grid-reducer"
import styles from "@/styles/pages/item-grid.module.scss"
import CustomLink from "@/components/ui/CustomLink";
import { getShortDayList } from "@/lib/utils";

type Props = {
  state: GridState,
  dispatch?: (arg: GridAction) => void, // currently not used
  deleteItem?: () => Promise<void>, // currently not used
  moveItems: (arg1: number, arg2: number) => Promise<void>
}

export default function ScheduleGrid({dispatch, ...props}: Props) {
  const {items, ...state} = props.state;
  // this component should only be included when there are actually items to display
  if (!items) return <></>;
  
  // for interactive elements
  const disabled = (state.status === 'awaitingUpdate' || state.status === 'dataLoading');


  // for item-only info - if the item has more than one schedule, the item details will need to occupy multiple rows
  function getGridRowStyle(schedules: number) {
    if (schedules <= 1) return {}
    else return {gridRow: `span ${schedules}`}
  }

  return (
    <div className={"grid " + styles.scheduleGrid}>
      <div aria-hidden='true' className="ignore-grid">
        {/* This text is hidden from AT because it is provided more sensibly elsewhere */}
        <span className="col-1 grid-header">Item </span>
        <span className="col-5 grid-header">Edit </span>
        <span className="col-6 grid-header">Move </span>
        <span className="col-2 grid-header">Amount </span>
        <span className="col-3 grid-header">Days </span>
        <span className="col-4 grid-header">Categories </span>
      </div>
      {items.map((item, index) =>
        <div key={index} className="ignore-grid">
            <div className={`grid-item ${styles.gridItem} ${styles.topItem}`} style={getGridRowStyle(item.schedules.length)}>
              <h2 className="no-heading-style">{item.name}</h2>
            </div>
            <div className={`grid-item ${styles.gridItem} ${styles.editItem} ${styles.topItem}`} style={getGridRowStyle(item.schedules.length)}>
              <CustomLink
                href={`/items/edit/${item.id}`}
                hiddenText={`Edit ${item.name}`}
                icon='edit'
                iconOnly={true}
              />
            </div>
            <div className={`grid-item ${styles.gridItem} ${styles.moveItem} ${styles.topItem}`} style={getGridRowStyle(item.schedules.length)}>
              { index > 0 ? <Button
                className="move-btn"
                onClick={() => props.moveItems(index, index-1)}
                hiddenText={`Move ${item.name} up`}
                icon="moveUp"
                iconOnly={true}
                disabled={disabled}
              />
              : ''}
              { index < items.length-1 ? <Button
                className="move-btn"
                onClick={() => props.moveItems(index, index+1)}
                hiddenText={`Move ${item.name} down`}
                icon="moveDown"
                iconOnly={true}
                disabled={disabled}
              />
              : ''}
            </div>
            {item.schedules.length > 0
            ? <div className="ignore-grid">
                {item.schedules.map((schedule, index) =>
                  <div className="ignore-grid" key={index}>
                    <div className={`grid-item ${styles.gridItem} ${index === 0 ? styles.topItem : ''}`}>
                      <h3 className="sr-only">Schedule {index+1}</h3>
                      <span className="sr-only">Amount: </span>
                      <span>{schedule.amount}</span>
                    </div>
                    <div className={`grid-item ${styles.gridItem} ${index === 0 ? styles.topItem : ''}`}>
                      <span className="sr-only">Days: </span>
                      <span>{getShortDayList(schedule)}</span>
                    </div>
                    <div className={`grid-item ${styles.gridItem} ${index === 0 ? styles.topItem : ''}`}>
                      <span className="sr-only">Categories: </span>
                      <span>{schedule.categories.map((field) => field.name).join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            : <div className={`grid-item ${styles.gridItem} ${styles.noSchedules} ${styles.topItem}`}>This item does not yet have any schedules.</div>
            }
        </div>
      )}
    </div>
  )
}