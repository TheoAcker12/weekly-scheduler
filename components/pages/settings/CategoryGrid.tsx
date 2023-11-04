import { categorySchema } from "@/lib/api_schema"
import { useImmerReducer } from "use-immer"
import { CategoryAction, CategoryState, categoryReducer } from "./category-reducer"
import { requestNoResponse, requestWithResponse } from "@/lib/utils";
import * as z from "zod";
import Alert from "@/components/ui/Alert";
import Loading from "@/components/ui/Loading";
import styles from "@/styles/pages/settings.module.scss";
import CustomLink from "@/components/ui/CustomLink";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// category grid actions
// - load data, load failed, dismiss errors, move category, delete category, 

export default function CategoryGrid() {
  const [state, dispatch] = useImmerReducer<CategoryState, CategoryAction>(categoryReducer, {status: 'loading', errors: []});

  const getData = async () => {
    const res = await requestWithResponse({
      route: '/api/category',
      args: {method: 'GET'},
      failureMsg: 'Category data failed to load'
    }, z.array(categorySchema));
    if (res.success) dispatch({type: 'dataLoaded', categories: res.payload});
    else dispatch({type: 'dataLoadFailed', error: res.error});
  }

  const deleteCategory = async () => {
    // get index/id to be deleted
    const index = state.activeDelete;
    if (!state.categories || index === undefined) return;
    const id = state.categories[index].id;
    // update state
    dispatch({type: 'delete/confirmed'});
    // delete the category
    const res = await requestNoResponse({
      route: `/api/category/${id}`,
      args: { method: 'DELETE' },
      failureMsg: 'Delete category failed'
    });
    if (res.success) dispatch({type: 'updateSucceeded'});
    else dispatch({type: 'updateFailed', error: res.error});
  }

  const addCategory = async () => {
    // get name of category to add
    const name = state.newCat;
    dispatch({type: 'newCatAdded'});
    // only proceed if name is not empty
    if (name && name.trim()) {
      const res = await requestNoResponse({
        route: `/api/category`,
        args: { method: 'POST', body: JSON.stringify({name, fields: []}) },
        failureMsg: 'Add category failed'
      });
      if (res.success) dispatch({type: 'updateSucceeded'});
      else dispatch({type: 'updateFailed', error: res.error});
    }
  }

  if (state.status === 'loading') getData();

  if (!state.categories) {
    if (state.status === 'default') return <Alert errors={state.errors} />
    else return <Loading />
  }

  return (
    <div>
      <Alert errors={state.errors} />
      <ul className={styles.categoriesList}>
        {state.categories.map((cat, index) =>
          <li key={index}>
            {state.activeDelete === index ?
              <div className={styles.deleteConfirmation}>
                <span>Are you sure you want to delete category "{cat.name}"? This action cannot be undone.</span>
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
              </div>
            :<>
              <span>
                <span className={styles.categoryName}>{cat.name}: </span>
                <span className={styles.categoryFields}>{cat.fields.map((f) => f.name).join(', ')}</span>
              </span>
              <CustomLink
                href={`categories/edit/${cat.id}`}
                className={styles.editBtn}
                icon='edit'
                iconOnly={true}
                hiddenText={`Edit Category: ${cat.name}`}
              />
              <Button
                id={`delete-${index}-btn`}
                className={styles.deleteBtn}
                icon='delete'
                iconOnly={true}
                hiddenText={`Delete Category: ${cat.name}`}
                onClick={() => dispatch({type: 'delete/clicked', index})}
              />
            </>}
          </li>
        )}
        <li>
          <Input
            labelText="New Category: "
            type='text'
            value={state.newCat ?? ''}
            onChange={(e) => dispatch({type: 'newCatEdited', name: e.target.value})}
          />
          <Button
            onClick={addCategory}
          >Add Category</Button>
        </li>
      </ul>
    </div>
  )
}