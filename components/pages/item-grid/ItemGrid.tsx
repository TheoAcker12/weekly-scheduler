import { Button } from "@/components/ui/Button";
import { GridAction, GridState } from "./grid-reducer"
import styles from "@/styles/pages/item-grid.module.scss"
import CustomLink from "@/components/ui/CustomLink";
import { getShortDayList } from "@/lib/utils";

type Props = {
  state: GridState,
  dispatch: (arg: GridAction) => void,
  deleteItem: () => Promise<void>,
  moveItems: (arg1: number, arg2: number) => Promise<void>
}

export default function ItemGrid({dispatch, ...props}: Props) {
  const {items, ...state} = props.state;
  // this component should only be included when there are actually items to display
  if (!items) return <></>;
  
  // for interactive elements
  const disabled = (state.status === 'awaitingUpdate' || state.status === 'dataLoading');

  return (
    <div className={"grid " + styles.itemGrid}>
      <div aria-hidden='true' className="ignore-grid">
        {/* This text is hidden from AT because it is provided more sensibly elsewhere */}
        <span className="col-1 grid-header">Name </span>
        <span className="col-5 grid-header">Edit </span>
        <span className="col-6 grid-header">Move </span>
        <span className="col-2 grid-header">Notes </span>
        <span className="col-3 grid-header">Categories </span>
        <span className="col-4 grid-header">Schedules </span>
        <span className="col-7 grid-header">Delete </span>
      </div>
      {items.map((item, index) =>
        <div key={index} className="ignore-grid">
          {state.activeDelete === index 
          ? <div className={`grid-item ${styles.gridItem} ${styles.deleteConfirmation}`}>
              <span>Are you sure you want to delete {item.name}? This action cannot be undone.</span>
              <div>
                <Button
                  icon='delete'
                  className="delete-btn"
                  onClick={() => props.deleteItem()}
                  disabled={disabled}
                >Confirm (delete {item.name})</Button>
                <Button
                  icon='x'
                  className="delete-cancel-btn"
                  onClick={() => dispatch({type: 'delete/canceled'})}
                  disabled={disabled}
                >Cancel</Button>
              </div>
            </div>
          :<>
            <div className={`name-col grid-item ${styles.gridItem}`}>
              {/* <span className="sr-only">Name: </span> */}
              <h2 className="no-heading-style">{item.name}</h2>
            </div>
            <div className={`grid-item ${styles.gridItem} ${styles.editItem}`}>
              <CustomLink
                href={`/items/edit/${item.id}`}
                hiddenText={`Edit ${item.name}`}
                icon='edit'
                iconOnly={true}
              />
            </div>
            <div className={`grid-item ${styles.gridItem} ${styles.moveItem}`}>
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
            <div className={`notes-col grid-item ${styles.gridItem}`}>
              {item.notes ? <span className="sr-only">Notes: </span> : ''}
              <span>{item.notes}</span>
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              {item.categories.length > 0 ? <span className="sr-only">Categories: </span> : ''}
              <span>{item.categories.map((field) => field.name).join(', ')}</span>
            </div>
            <div className={`grid-item ${styles.gridItem}`}>
              {item.schedules.length > 0 ? <span className="sr-only">Schedules: </span> : ''}
              {item.schedules.map((s, index) => 
                <span key={index}>
                  <span className="schedule-amount">{s.amount}: </span>
                  <span className="schedule-days">{getShortDayList(s)}{index < item.schedules.length-1 ? ';' : ''}</span>
                </span>
              )}
            </div>
            <div className={`grid-item ${styles.gridItem} ${styles.deleteItem}`}>
              <Button 
                className="delete-btn"
                onClick={() => dispatch({type: 'itemDeleted', index})}
                hiddenText={`Delete ${item.name}`}
                icon='delete'
                iconOnly={true}
                disabled={disabled}
              />
            </div>
          </>}
        </div>
      )}
    </div>
  )
}