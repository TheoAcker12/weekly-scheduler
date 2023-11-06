import { Schedule } from "@/lib/api_schema"
import { DeleteAction } from "./item-reducer"
import styles from "@/styles/pages/item.module.scss";
import { getShortDayList } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Props = {
  schedules: Schedule[],
  activeDelete?: number,
  disabled?: boolean,
  dispatch: (arg: {type: 'scheduleEditorSelected', index: number}|DeleteAction) => void,
  deleteSchedule: () => Promise<void>
}

export default function ItemSchedulesGrid({schedules, activeDelete, disabled, ...props}: Props) {
  return (
    <div className={`grid ${styles.scheduleGrid}`}>
      <div aria-hidden='true' className="ignore-grid">
        {/* This text is hidden from AT because it is provided more sensibly elsewhere */}
        <span className="col-1 grid-header">Amount </span>
        <span className="col-4 grid-header">Edit </span>
        <span className="col-2 grid-header">Days </span>
        <span className="col-3 grid-header">Categories </span>
        <span className="col-5 grid-header">Delete </span>
      </div>
      {schedules.map((s, index) =>
        <div key={index} className="ignore-grid">
          {activeDelete === index
          ? <div className={`grid-item ${styles.gridItem} ${styles.deleteConfirmation}`}>
              <span>Are you sure you want to delete schedule: {s.amount}; {getShortDayList(s)}? This action cannot be undone.</span>
              <div>
                <Button
                  icon='delete'
                  onClick={props.deleteSchedule}
                >Yes, delete it</Button>
                <Button
                  icon='x'
                  onClick={() => props.dispatch({type: 'delete/canceled'})}
                >No, cancel</Button>
              </div>
            </div>
          : <>
            <div className={`grid-item ${styles.gridItem}`}>
              <h3 className="sr-only">Schedule {index+1}</h3>
              <span className="sr-only">Amount: </span>
              <span>{s.amount}</span>
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              <Button
                id={`edit-schedule-${index}-btn`}
                icon='edit'
                iconOnly={true}
                hiddenText={`Edit schedule ${index+1}`}
                disabled={disabled}
                onClick={() => props.dispatch({type: 'scheduleEditorSelected', index})}
              />
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              <span className="sr-only">Days: </span>
              <span>{getShortDayList(s)}</span>
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              <span className="sr-only">Categories: </span>
              <span>{s.categories.map((field) => field.name).join(', ')}</span>
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              <Button
                id={`delete-schedule-${index}-btn`}
                icon='delete'
                iconOnly={true}
                hiddenText={`Delete schedule ${index}`}
                disabled={disabled}
                onClick={() => props.dispatch({type: 'delete/clicked', index})}
              />
            </div>
          </>}
        </div>
      )}
    </div>
  )
}