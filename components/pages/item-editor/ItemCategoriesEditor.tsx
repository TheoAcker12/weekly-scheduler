import { Category, Item, ItemPatchAction, SchedulePatchAction } from "@/lib/api_schema"
import { useState } from "react"
import styles from "@/styles/pages/item.module.scss";
import Heading from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

// state - keeps track of which category/field combination is selected at any given time
type SelectState =
| { cat: 'default', field?: undefined }
| { cat: number, field: 'default' | number }

type Props = {
  formType: 'item' | 'schedule', // form may show up twice on same page, so needs to be differentiated
  categories: Category[],
  attachedFields: Item['categories'], // categories/fields attached to the item/schedule
  // special function - editing categories for items/schedules is basically the same, just need to tell parent what the categories will look like now and what action to perform on the database
  dispatch: (updateAction: ItemPatchAction&SchedulePatchAction, modifiedFields: Item['categories']) => Promise<void>,
  disabled: boolean,
}

export function ItemCategoriesEditor({formType, categories, attachedFields, dispatch, disabled}: Props) {
  const [selectState, setSelectState] = useState<SelectState>({cat: 'default'});

  // handlers - editing
  const addCategory = () => {
    // category and field must both be selected and valid
    if (typeof selectState.cat !== 'number' || typeof selectState.field !== 'number') return;
    const cat = categories[selectState.cat];
    const field = cat.fields[selectState.field];
    const newCategories: Item['categories'] = [...attachedFields, {id: field.id, name: field.name, category: { name: cat.name }}];
    dispatch({type: 'category/add', id: field.id}, newCategories);
    // clear selections
    setSelectState({cat: 'default'});
  }
  const removeCategory = (index: number) => {
    // index must be valid
    if (!attachedFields[index]) return;
    const newCategories = [...attachedFields.slice(0, index), ...attachedFields.slice(index+1)];
    dispatch({type: 'category/remove', id: attachedFields[index].id}, newCategories);
  }
  // handlers - selecting
  const selectCategory = (value: string) => {
    // validate selected category
    const index = parseInt(value);
    if (isNaN(index) || !categories[index]) {
      // invalid category, clear selection
      setSelectState({cat: 'default'});
    } else {
      // valid category - if selection has changed, clear field selection, otherwise change nothing
      if (index !== selectState.cat) setSelectState({cat: index, field: 'default'});
    }
  }
  const selectField = (value: string) => {
    // should only be possible to select field option when category selection is valid, but never hurts to check
    const cat = selectState.cat
    if (typeof cat !== 'number' || !categories[cat]) return;
    // validate selected field
    const index = parseInt(value);
    if (isNaN(index) || !categories[cat].fields[index]) setSelectState({cat, field: 'default'});
    else setSelectState({cat, field: index});
  }

  // limit field options based on selected category - only include fields from that category that have not already been added
  const getFieldOptions = (): {defaultOption: string, fields: JSX.Element[]|undefined} => {
    const defaultOption = 'Pick a field...';
    // no category selected?
    if (typeof selectState.cat !== 'number') return {defaultOption, fields: undefined}
    // filter out fields already added
    const itemFieldIds = attachedFields.map((f) => f.id); // list of ids already added
    const newFields = categories[selectState.cat].fields
      // first map so that we are storing index - otherwise index will get messed up
      .map ((f, index) => ({...f, index}))
      .filter((f) => (f.id && !itemFieldIds.includes(f.id)));
    // no new fields?
    if (newFields.length === 0) return {defaultOption: 'All fields already added', fields: undefined};
    // turn fields into options before returning
    return {defaultOption, fields: newFields.map((f) => <option key={f.index} value={f.index}>{f.name}</option>)};
  }
  // get field options (if applicable) for category field select
  const fieldOptions = getFieldOptions();

  return (
    <div className={styles.categoryEditor}>
      <Heading level={formType === 'item' ? '2' : '3'}>Categories</Heading>
      {attachedFields.length > 0
        ? <ul>
            {attachedFields.map((field, index) =>
              <li key={index}>
                <div>
                  <i>{field.category.name}: </i>
                  <span>{field.name}</span>
                  <Button
                    icon='delete'
                    iconOnly={true}
                    hiddenText={`Remove ${field.name}`}
                    disabled={disabled}
                    onClick={() => removeCategory(index)}
                  />
                </div>
              </li>
            )}
          </ul>
        : <div>No categories have been added yet.</div>
      }
      <div className={styles.newCategorySection}>
        <Select
          id={`${formType}-category-select`}
          labelText="Category: "
          hideLabel={true}
          defaultOption='Pick a category...'
          value={selectState.cat}
          onChange={(e) => selectCategory(e.target.value)}
        >
          {categories.map((cat, index) => <option key={index} value={index}>{cat.name}</option>)}
        </Select>
        <Select
          id={`${formType}-field-select`}
          labelText="Field: "
          hideLabel={true}
          defaultOption={fieldOptions.defaultOption}
          disabled={!fieldOptions.fields}
          value={selectState.field ?? 'default'}
          onChange={(e) => selectField(e.target.value)}
        >
          {fieldOptions.fields}
        </Select>
        <Button
          id={`${formType}-add-field-btn`}
          // disabled if field options are not available (i.e. category is invalid), or if field selection is invalid
          disabled={!fieldOptions.fields || typeof selectState.field !== 'number'}
          onClick={addCategory}
        >Add Category</Button>
      </div>
    </div>
  )
}