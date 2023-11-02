import { useImmerReducer } from "use-immer";
import { GridAction, GridState, gridReducer } from "./grid-reducer";
import * as z from "zod";
import { itemListItemSchema } from "@/lib/api_schema";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";
import ItemGrid from "./ItemGrid";


export default function ItemGridWrapper() {
  const [{items, ...state}, dispatch] = useImmerReducer<GridState, GridAction>(gridReducer, {status: 'dataLoading', errors: []});

  // database interaction
  const getData = async () => {
    try {
      const res = await fetch('/api/item', {
        method: 'GET',
      });
      if (!res.ok) {
        // failed to load data - don't keep trying
        dispatch({type: 'dataLoadFailed', error: {msg: 'Item data failed to load. Server responded with status:' + res.status + ', ' + res.statusText}});
        return;
      }
      const body = await res.json();
      const items = z.array(itemListItemSchema).parse(body);
      dispatch({type: 'dataLoaded', items});
    } catch (e) {
      if (e instanceof Error) dispatch ({type: 'dataLoadFailed', error: {msg: e.message}});
      else dispatch({type: 'dataLoadFailed', error: {msg: 'An unknown error occured when trying to load data.'}});
    }
  }
  const deleteItem = async () => {
    // get index to be deleted before updating the state (updating state will remove the index from state)
    const index = state.activeDelete;
    if (!items || index === undefined) return; // data is required and delete must be active
    const id = items[index].id;

    // update state
    dispatch({type: 'delete/confirmed'});
    // delete the item
    try {
      const res = await fetch(`/api/item/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        dispatch({type: 'updateFailed', error: {msg: `Deletion failed: Server responded with status: ${res.status}, ${res.statusText}`}});
        return;
      }
      // otherwise, success
      dispatch({type: 'updateSucceeded'});
    } catch (e) {
      let error = {msg: 'An unknown error occured when trying to delete the item.'};
      if (e instanceof Error) error = {msg: 'Delete item failed: ' + e.message};
      dispatch({type: 'updateFailed', error});
    }
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
    try {
      const res = await fetch(`api/item`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(moveData),
      });
      if (!res.ok) {
        dispatch({type: 'updateFailed', error: {msg: `Move items failed: Server responded with status: ${res.status}, ${res.statusText}`}});
        return;
      }
      // success
      dispatch({type: 'updateSucceeded'});
    } catch (e) {
      let error = {msg: 'An unknown error occured when trying to move the items.'};
      if (e instanceof Error) error = {msg: 'Move items failed: ' + e.message};
      dispatch({type: 'updateFailed', error});
    }
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
    <ItemGrid
      state={{items, ...state}}
      dispatch={dispatch}
      deleteItem={deleteItem}
      moveItems={moveItems}
    />
  </>)
}