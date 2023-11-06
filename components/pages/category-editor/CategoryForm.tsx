import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categorySchema } from "@/lib/api_schema";
import styles from "@/styles/pages/category.module.scss";
import { useImmerReducer } from "use-immer";
import { CategoryAction, CategoryState, categoryReducer } from "./category-reducer";
import { requestNoResponse, requestWithResponse } from "@/lib/utils";
import { useRouter } from "next/router";
import Loading from "@/components/ui/Loading";
import CustomLink from "@/components/ui/CustomLink";

type Props = {
  cat_id: number,
}

export default function CategoryForm(props: Props) {
  const [{category, ...state}, dispatch] = useImmerReducer<CategoryState, CategoryAction>(categoryReducer, {status: 'loading', errors: []});
  const router = useRouter();

  const getData = async () => {
    const res = await requestWithResponse({
      route: `/api/category/${props.cat_id}`,
      args: { method: 'GET' },
      failureMsg: 'Category failed to load'
    }, categorySchema);
    if (res.success) dispatch({type: 'dataLoaded', category: res.payload});
    else dispatch({type: 'dataLoadFailed', error: res.error});
  }
  const deleteCategory = async () => {
    const res = await requestNoResponse({
      route: `/api/category/${props.cat_id}`,
      args: { method: 'DELETE' },
      failureMsg: 'Delete category failed'
    });
    if (res.success) router.push('/settings'); // no reason to stay on a page for a category that does not exist
    else dispatch({type: 'update/failed', error: res.error});
  }
  const moveFields = async (index1: number, index2: number) => {
    if (!category) return;
    const f1 = category.fields[index1];
    const f2 = category.fields[index2];
    if (!f1 || !f2) return;
    // prepare move data before updating state
    const moveData = [
      {id: f1.id, order: f2.order},
      {id: f2.id, order: f1.order},
    ];
    // update state
    dispatch({type: 'fieldsMoved', index1, index2});
    // move the fields
    const res = await requestNoResponse({
      route: '/api/field',
      args: {method: 'PATCH', body: JSON.stringify(moveData)},
      failureMsg: 'Move fields failed',
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const updateCategory = async () => {
    if (!category || !state.nameModified) return;
    // update
    dispatch({type: 'update/requested'});
    const res = await requestNoResponse({
      route: `/api/category/${props.cat_id}`,
      args: {method: 'PATCH', body: JSON.stringify({name: category.name})},
      failureMsg: 'Update category name failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const updateField = async (index: number) => {
    if (!category || !category.fields[index] || !state.nameModified) return;
    // update
    dispatch({type: 'update/requested'});
    const res = await requestNoResponse({
      route: `/api/field/${category.fields[index].id}`,
      args: {method: 'PATCH', body: JSON.stringify({name: category.fields[index].name})},
      failureMsg: 'Update field name failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const addField = async () => {
    if (!category) return;
    // place field at end of list
    const order = category.fields.length > 0 ? category.fields[category.fields.length-1].order + 1 : 0;
    // update
    dispatch ({type: 'update/requested'});
    const res = await requestNoResponse({
      route: '/api/field',
      args: {method: 'POST', body: JSON.stringify({name: 'New Field', order, cat_id: category.id})},
      failureMsg: 'Add field failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }
  const deleteField = async () => {
    if (state.activeDelete === undefined || !category?.fields[state.activeDelete]) return;
    const id = category.fields[state.activeDelete].id;
    dispatch({type: 'delete/confirmed'});
    const res = await requestNoResponse({
      route: `/api/field/${id}`,
      args: {method: 'DELETE'},
      failureMsg: 'Delete field failed'
    });
    if (res.success) dispatch({type: 'update/succeeded'});
    else dispatch({type: 'update/failed', error: res.error});
  }

  if (state.status === 'loading') getData();

  if (!category) {
    if (state.status === 'default') return <Alert errors={state.errors} />
    else return <Loading />
  }
  
  // for interactive elements
  const disabled = (state.status !== 'default');

  return (
    <div>
      <Alert errors={state.errors} />
      <form>
        <Input
          id='cat-name-input'
          labelText='Category Name: '
          type='text'
          parentProps={{className: 'grid-item'}}
          disabled={disabled}
          value={category.name}
          onChange={(e) => dispatch({type: 'categoryEdited', value: e.target.value})}
          onBlur={updateCategory}
        />
        <h2>Fields</h2>
        <div className={`grid ${styles.fieldsList}`}>
          {category.fields.map((field, index) =>
            <div key={index} className="ignore-grid">
              <h3 className="sr-only">{field.name ? field.name : 'Field with no name set'}</h3>
              {state.activeDelete === index
              ? <div className={`grid-item ${styles.deleteConfirmation}`}>
                  <span>Are you sure you want to delete {field.name ? 'field: ' + field.name : 'this field'}? This action cannot be undone.</span>
                  <div>
                    <Button
                      icon='delete'
                      disabled={disabled}
                      onClick={deleteField}
                    >Confirm (delete {field.name ? field.name : 'this field'})</Button>
                    <Button
                      icon='x'
                      disabled={disabled}
                      onClick={() => dispatch({type: 'delete/canceled'})}
                    >Cancel</Button>
                  </div>
                </div>
              :<>
                <Input
                  id={`field-${index}-name-input`}
                  parentProps={{className: 'grid-item'}}
                  labelText='Edit field name'
                  hideLabel={true}
                  type='text'
                  disabled={disabled}
                  value={field.name}
                  onChange={(e) => dispatch({type: 'fieldEdited', index, value: e.target.value})}
                  onBlur={() => updateField(index)}
                />
                <div className="grid-item">
                  { index > 0 ? <Button
                    className="move-btn"
                    icon='moveUp'
                    iconOnly={true}
                    hiddenText={`Move ${field.name ? field.name : 'this field'} up`}
                    disabled={disabled}
                    onClick={() => moveFields(index, index-1)}
                  /> : ''}
                </div>
                <div className="grid-item">
                  { index < category.fields.length-1 ? <Button
                    className="move-btn"
                    icon='moveDown'
                    iconOnly={true}
                    hiddenText={`Move ${field.name ? field.name : 'this field'} down`}
                    disabled={disabled}
                    onClick={() => moveFields(index, index+1)}
                  /> : ''}
                </div>
                <div className={`grid-item ${styles.deleteBtn}`}>
                  <Button
                    icon='delete'
                    iconOnly={true}
                    hiddenText={`Delete ${field.name ? field.name : 'this field'}`}
                    disabled={disabled}
                    onClick={() => dispatch({type: 'delete/clicked', index})}
                  />
                </div>
              </>}
            </div>
          )}
        </div>
        <Button
          disabled={disabled}
          onClick={addField}
        >Add new field</Button>
        <hr />
        <div className="form-btn-row">
          {state.activeDelete === -1
          ?<div className={styles.deleteConfirmation}>
              <span>Are you sure you want to delete this category? This action cannot be undone.</span>
              <div>
                <Button
                  id='confirm-delete-btn'
                  icon='delete'
                  onClick={deleteCategory}
                >Yes, delete it</Button>
                <Button
                  id='cancel-delete-btn'
                  icon='x'
                  onClick={() => dispatch({type: 'delete/canceled'})}
                >No, cancel</Button>
              </div>
          </div>:<>
            <CustomLink
              href='/settings'
            >Back to Settings</CustomLink>
            <Button
              icon='delete'
              onClick={() => dispatch({type: 'delete/clicked', index: -1})}
            >Delete Category</Button>
          </>}
        </div>
      </form>
    </div>
  )
}