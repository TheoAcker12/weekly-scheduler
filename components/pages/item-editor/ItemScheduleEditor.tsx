import { Category, Schedule, SchedulePatchAction } from "@/lib/api_schema"
import { ItemAction, ItemState } from "./item-reducer"
import styles from "@/styles/pages/item.module.scss";
import { Input } from "@/components/ui/Input";
import { Day, days } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ItemCategoriesEditor } from "./ItemCategoriesEditor";


type Props = {
  state: ItemState,
  disabled: boolean,
  dispatch: (arg: ItemAction) => void, // general dispatch function from reducer - for modifying activeDelete, activeSchedule, and schedule amount
  deleteSchedule: () => Promise<void>, // deletes schedule from db
  updateScheduleDay: (day: Day|'all', value: boolean) => Promise<void>, // updates schedule in db
  updateSchedule: (action: SchedulePatchAction, categories?: Schedule['categories']) => Promise<void>, // updates schedule in db
}

export default function ItemScheduleEditor({state, disabled, ...props}: Props) {
  const activeSchedule = state.activeSchedule;
  if (!activeSchedule || !state.item?.schedules[activeSchedule] || !state.categories) return <></>;
  const schedule = state.item.schedules[activeSchedule];

  return (
    <div className={styles.schedulesEditor}>
      <h2>Edit Schedule #{activeSchedule+1}</h2>
      <Input
        id='schedule-amount-input'
        labelText="Amount: "
        type='text'
        size={40}
        className={styles.amountInput}
        value={schedule.amount}
        disabled={disabled}
        onChange={(e) => props.dispatch({type: 'scheduleAmountEdited', value: e.target.value})}
        onBlur={() => {if (state.currentFieldModified) props.updateSchedule({type: 'amount', amount: schedule.amount})}}
      />
      <fieldset className="checkbox-group">
        <legend>Days</legend>
        {days.map((day) =>
          <Input
            key={day}
            type='checkbox'
            id={`${day}-checkbox`}
            labelText={day}
            checked={schedule[day]}
            disabled={disabled}
            onChange={(e) => props.updateScheduleDay(day, e.target.checked)}
          />
        )}
        <Button
          onClick={() => props.updateScheduleDay('all', true)}
        >Add all days</Button>
        <Button
          onClick={() => props.updateScheduleDay('all', false)}
        >Clear days</Button>
      </fieldset>
      <ItemCategoriesEditor
        formType='schedule'
        categories={state.categories}
        attachedFields={schedule.categories}
        disabled={disabled}
        dispatch={props.updateSchedule}
      />
      <div className="form-btn-row">
        {state.activeDelete === activeSchedule
        ? <div className={styles.deleteConfirmation}>
            <span>Are you sure you want to delete this schedule? This action cannot be undone.</span>
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
          <Button
            icon='x'
            onClick={() => props.dispatch({type: 'scheduleEditorSelected'})}
          >Close Editor</Button>
          <Button
            icon='delete'
            onClick={() => props.dispatch({type: 'delete/clicked', index: activeSchedule})}
          >Delete Schedule</Button>
        </>}
      </div>
    </div>
  )
}