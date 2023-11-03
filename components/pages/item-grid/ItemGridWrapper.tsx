import { useImmerReducer } from "use-immer";
import { GridAction, GridState, gridReducer } from "./grid-reducer";
import * as z from "zod";
import { itemListItemSchema } from "@/lib/api_schema";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";
import ItemGrid from "./ItemGrid";
import ScheduleGrid from "./ScheduleGrid";
import { requestNoResponse, requestWithResponse } from "@/lib/utils";

type Props = {
  gridType?: 'item' | 'schedule',
}

export default function ItemGridWrapper(props: Props) {
  const [{items, ...state}, dispatch] = useImmerReducer<GridState, GridAction>(gridReducer, {status: 'dataLoading', errors: []});

  // database interaction
  const getData = async () => {
    const res = await requestWithResponse({
      route: '/api/item',
      args: {method: 'GET'},
      failureMsg: 'Item data failed to load'
    }, z.array(itemListItemSchema));
    if (res.success) dispatch({type: 'dataLoaded', items: res.payload});
    else dispatch({type: 'dataLoadFailed', error: res.error});
  }

  const deleteItem = async () => {
    // get index to be deleted before updating the state (updating state will remove the index from state)
    const index = state.activeDelete;
    if (!items || index === undefined) return; // data is required and delete must be active
    const id = items[index].id;
    // update state
    dispatch({type: 'delete/confirmed'});
    // delete the item
    const res = await requestNoResponse({
      route: `/api/item/${id}`,
      args: { method: 'DELETE' },
      failureMsg: 'Delete item failed'
    });
    if (res.success) dispatch({type: 'updateSucceeded'});
    else dispatch({type: 'updateFailed', error: res.error});
  }

  const moveItems = async (index1: number, index2: number) => {
    if (!items || !items[index1] || !items[index2]) return;
    // prepare move data before updating state
    const moveData = [
      {id: items[index1].id, order: items[index2].order},
      {id: items[index2].id, order: items[index1].order}
    ];
    // update state
    dispatch({type: 'itemsMoved', index1, index2});
    // move the items
    const res = await requestNoResponse({
      route: '/api/item',
      args: {method: 'PATCH', body: JSON.stringify(moveData)},
      failureMsg: 'Move items failed'
    });
    if (res.success) dispatch({type: 'updateSucceeded'});
    else dispatch({type: 'updateFailed', error: res.error});
  }

  if (!items) {
    if (state.status !== 'dataLoading') return <Alert errors={state.errors} />
    else {
      getData();
      return <Loading />
    }
  }
  if (state.status === 'dataLoading') getData();
  // make sure there is at least one item before displaying the grid
  if (items.length === 0) return <div>No items found</div>
  return (<>
    <Alert errors={state.errors} />
    {props.gridType === 'schedule' ?
      <ScheduleGrid
        state={{items, ...state}}
        dispatch={dispatch}
        deleteItem={deleteItem}
        moveItems={moveItems}
      />
    :
      <ItemGrid
        state={{items, ...state}}
        dispatch={dispatch}
        deleteItem={deleteItem}
        moveItems={moveItems}
      />
    }
  </>)
}