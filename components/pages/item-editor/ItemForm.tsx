import { useImmerReducer } from "use-immer";
import { ItemAction, ItemState, itemReducer } from "./item-reducer";
import { useRouter } from "next/router";
import { Item, ItemPatchAction, Schedule, SchedulePatchAction, categorySchema, itemSchema } from "@/lib/api_schema";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";
import { Input } from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import styles from "@/styles/pages/item.module.scss";
import { Button } from "@/components/ui/Button";
import CustomLink from "@/components/ui/CustomLink";
import { ItemCategoriesEditor } from "./ItemCategoriesEditor";
import ItemSchedulesGrid from "./ItemSchedulesGrid";
import ItemScheduleEditor from "./ItemScheduleEditor";
import { Day, dayKeys } from "@/lib/types";
import { requestNoResponse, requestWithResponse } from "@/lib/utils";
import * as z from "zod";

type Props = {
  item_id: number,
}

export default function ItemForm(props: Props) {
  const [{item, categories, ...state}, dispatch] = useImmerReducer<ItemState, ItemAction>(itemReducer, {status: 'loading', errors: []});
  const router = useRouter();

  const getData = async () => {
    // get category data if it does not exist, otherwise get/replace item data
    if (!categories) {
      const res = await requestWithResponse({
        route: '/api/category',
        args: {method: 'GET'},
        failureMsg: 'Category data failed to load'
      }, z.array(categorySchema));
      if (res.success) dispatch({type: 'categoriesLoaded', categories: res.payload});
      else dispatch({type: 'dataLoadFailed', error: res.error});
    }
    else {
      const res = await requestWithResponse({
        route: `/api/item/${props.item_id}`,
        args: {method: 'GET'},
        failureMsg: 'Item failed to load'
      }, itemSchema);
      if (res.success) dispatch({type: 'itemLoaded', item: res.payload});
      else dispatch({type: 'dataLoadFailed', error: res.error});
    }
  }
  const deleteItem = async () => {
    const res = await requestNoResponse({
      route: `/api/item/${props.item_id}`,
      args: {method: 'DELETE'},
      failureMsg: 'Delete item failed'
    });
    if (res.success) router.push('/items'); // no reason to stay on a page for an item that does not exist
    else dispatch({type: 'update/failed', error: res.error});
  }
  const updateItem = async (action: ItemPatchAction, tmpNewFields?: Item['categories']) => {
    if (!item || !categories) return;
    // update
    if (tmpNewFields) dispatch({type: 'item/categoriesEdited', categories: tmpNewFields});
    else dispatch({type: 'update/requested'});
    const res = await requestNoResponse({
      route: `/api/item/${props.item_id}`,
      args: {method: 'PATCH', body: JSON.stringify(action)},
      failureMsg: 'Item update failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const addSchedule = async () => {
    if (!item) return;
    // update
    dispatch ({type: 'update/requested'});
    const body = {
      amount: 'New Schedule',
      item_id: props.item_id,
      ...dayKeys<boolean>(false)
    }
    const res = await requestNoResponse({
      route: '/api/schedule',
      args: {method: 'POST', body: JSON.stringify(body)},
      failureMsg: 'Add schedule failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const deleteSchedule = async () => {
    if (state.activeDelete === undefined || !item?.schedules[state.activeDelete]) return;
    const id = item.schedules[state.activeDelete].id;
    dispatch({type: 'delete/confirmed'});
    const res = await requestNoResponse({
      route: `/api/schedule/${id}`,
      args: {method: 'DELETE'},
      failureMsg: 'Delete schedule failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const updateScheduleDay = async (day: Day|'all', value: boolean) => {
    if (!state.activeSchedule || !item?.schedules[state.activeSchedule]) return;
    dispatch({type: 'scheduleDayEdited', day, value});
    const schedule = item.schedules[state.activeSchedule];
    // request type
    const action: SchedulePatchAction = day==='all' ? {type: 'all-days', value} : {type: 'day', day, value};
    const res = await requestNoResponse({
      route: `/api/schedule/${schedule.id}`,
      args: {method: 'PATCH', body: JSON.stringify(action)},
      failureMsg: 'Schedule update failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const updateSchedule = async (action: SchedulePatchAction, tmpNewFields?: Item['categories']) => {
    if (!state.activeSchedule || !item?.schedules[state.activeSchedule]) return;
    if (tmpNewFields) dispatch({type: 'scheduleCategoriesEdited', categories: tmpNewFields});
    else dispatch({type: 'update/requested'});
    const schedule = item.schedules[state.activeSchedule];
    const res = await requestNoResponse({
      route: `/api/schedule/${schedule.id}`,
      args: {method: 'PATCH', body: JSON.stringify(action)},
      failureMsg: 'Schedule update failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }

  if (state.status === 'loading') getData();

  if (!item || !categories) {
    if (state.status === 'default') return <Alert errors={state.errors} />
    else return <Loading />
  }
  
  // for interactive elements
  const disabled = (state.status !== 'default');

  return (
    <div>
      <Alert errors={state.errors} />
      <form>
        <div className={styles.itemDetails}>
          <Input
            id='name-input'
            labelText="Item Name: "
            disabled={disabled}
            type='text'
            value={item.name}
            onChange={(e) => dispatch({type: 'item/nameEdited', value: e.target.value})}
            onBlur={() => {if (state.currentFieldModified) updateItem({type: 'name', name: item.name})}}
          />
          <Textarea
            id='notes-input'
            label="Notes: "
            rows={2}
            cols={50}
            disabled={disabled}
            value={item.notes ?? ''}
            onChange={(e) => dispatch({type: 'item/notesEdited', value: e.target.value})}
            onBlur={() => {if (state.currentFieldModified) updateItem({type: 'notes', notes: item.notes ?? ''})}}
          />
        </div>
        <ItemCategoriesEditor
          formType='item'
          categories={categories}
          attachedFields={item.categories}
          disabled={disabled}
          dispatch={updateItem}
        />
        <h2>Schedules</h2>
        <ItemSchedulesGrid
          schedules={item.schedules}
          activeDelete={state.activeDelete}
          disabled={disabled}
          dispatch={dispatch}
          deleteSchedule={deleteSchedule}
        />
        <Button
          id='add-schedule-btn'
          disabled={disabled}
          onClick={addSchedule}
        >Add New Schedule</Button>
        <ItemScheduleEditor
          state={{item, categories, ...state}}
          disabled={disabled}
          dispatch={dispatch}
          deleteSchedule={deleteSchedule}
          updateSchedule={updateSchedule}
          updateScheduleDay={updateScheduleDay}
        />
        <hr />
        <div className="form-btn-row">
          {state.activeDelete === -1
          ? <div className={styles.deleteConfirmation}>
              <span>Are you sure you want to delete this item? This action cannot be undone.</span>
              <div>
                <Button
                  icon='delete'
                  disabled={disabled}
                  onClick={deleteItem}
                >Yes, delete it</Button>
                <Button
                  icon='x'
                  disabled={disabled}
                  onClick={() => dispatch({type: 'delete/canceled'})}
                >No, cancel</Button>
              </div>
            </div>
          : <>
            <CustomLink
              href='/items'
            >Back to Items</CustomLink>
            <Button
              icon='delete'
              disabled={disabled}
              onClick={() => dispatch({type: 'delete/clicked', index: -1})}
            >Delete Item</Button>
          </>}
        </div>
      </form>
    </div>
  )
}