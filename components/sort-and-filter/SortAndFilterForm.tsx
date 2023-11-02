import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import CustomLink from '@/components/ui/CustomLink';
import styles from '@/styles/filter-form.module.scss'
import { ParsedUrlQuery } from 'querystring';
import { Category } from '@/lib/api_schema';
import { useImmerReducer } from 'use-immer';
import { FilterAction, FilterState, filterReducer } from './filters-reducer';
import { parseFilterParams, parseSortParam } from '@/lib/utils';
import { Filter } from '@/lib/types';

type Props = {
  params: ParsedUrlQuery,
  categories: Category[],
}

/**
 * get a list of category options for a given filter - cannot include any categories selected in other filters (basically, narrow down the options provided by checking other filters)
 * 
 * @param index number: the index of the filter to provide the options for
 * @param catOptions list of elements: List of options - one for each category, in the same order as the categories list
 * @param filters Filter[]: all current filters, filters[index] is the one we are looking at
 * @returns list of category options to select from - will include the currently selected category, but not any categories selected by other filters
 */
function getFilterCatOptions(index: number, catOptions: JSX.Element[], filters: Filter[]): JSX.Element[] {
  // list all selected categories, excluding this filter (as defined by index)
  const categories: number[] = filters.reduce<number[]>((list, filter, i) => {
    if (filter.cat_index !== -1 && index !== i) list.push(filter.cat_index);
    return list;
  }, [])
  // return only options that have not been included in the above list
  return catOptions.filter((o, i) => !categories.includes(i));
}

/**
 * get a list of field options for a given filter - determine correct default option and potential fields depending on currently selected category
 * 
 * @param filter Filter: the filter we care about
 * @param categories Category[]: list of all categories from database
 * @returns list of field options to select from - will include a default option, and, if a category is selected, options to add all fields, remove all fields, and toggle each field
 */
function getFilterFieldOptions(filter: Filter, categories: Category[]): JSX.Element[] {
  // valid category selected?
  if (filter.cat_index === -1) return [<option key='default' value='default'>No category selected</option>];
  // empty arrays to place options for adding and removing fields into
  const addOpts: JSX.Element[] = [];
  const removeOpts: JSX.Element[] = [];
  // determine which fields can be added vs. removed
  const cat = categories[filter.cat_index];
  for (let i = 0; i < cat.fields.length; i++) {
    const add = !filter.field_index_list.includes(i);
    const option = <option key={i} value={i}>{add ? 'Add' : 'Remove'} {cat.fields[i].name}</option>
    if (add) addOpts.push(option);
    else removeOpts.push(option);
  }
  // add optgroups (if applicable)
  const options = [<option key='default' value='default'>Select an action...</option>];
  if (addOpts.length) options.push(<optgroup label='Add' key='add'>{addOpts}</optgroup>);
  if (removeOpts.length) options.push(<optgroup label='Remove' key='remove'>{removeOpts}</optgroup>);
  // add standard options (if applicable)
  if (addOpts.length) options.push(<option key='addAllFields' value='addAllFields'>Add all fields</option>);
  if (removeOpts.length) options.push(<option key='clearAllFields' value='clearAllFields'>Remove all fields</option>);
  return options;
}

/**
 * Build list of filters that can be added to a url query (for 'Apply filters' link)
 * 
 * @param include boolean: true if for 'include' filters, false if for 'exclude'
 * @param filterList Filter[]: filters from the state
 * @param categories Category[]: from database
 */
function buildFilterParams(include: boolean, filterList: Filter[], categories: Category[]): string[]|undefined {
  // first filter the filters - must have valid category index and must match the include parameter
  const filters = filterList.filter((filter) => filter.cat_index !== -1 && filter.include === include);
  // then format strings
  const filterParams = filters.map((filter) => {
    const cat = categories[filter.cat_index];
    const field_ids = filter.field_index_list.map((index) => cat.fields[index].id);
    return `${cat.id}_${field_ids.join('-')}`;
  })
  if (filterParams.length > 0) return filterParams;
  else return undefined;
}

export default function SortAndFilterForm({ categories, ...props}: Props) {
  const [state, dispatch] = useImmerReducer<FilterState, FilterAction>(filterReducer,  {
    sortIndex: parseSortParam(props.params['sort_by'], categories),
    filters: [
      ...parseFilterParams(true, props.params['include'], categories),
      ...parseFilterParams(false, props.params['exclude'], categories),
    ],
    filtersExpanded: false,
  });

  // for use populating sort and filter category select options
  const catOptions = categories.map((cat, index) => <option key={index} value={index}>{cat.name}</option>);

  // button may show up in one of two different places, so defining it outside of the return statement
  const addFilterBtn = <Button
    id='add-filter-btn'
    onClick={() => dispatch({type: 'form/filterAdded'})}
  >Add Filter</Button>

  return (
    <fieldset>
      <legend>Sort and Filter</legend>
      <Select
        className='sort-options'
        id='sort-select'
        onChange={(e) => dispatch({type: 'form/sortCategorySelected', value: e.target.value, categories})}
        value={state.sortIndex ?? 'default'}
        labelText='Sort by: '
        defaultOption='Select a category...'
      >
        {catOptions}
      </Select>
      <hr />
      <div className='filters-summary'>
        <span>Filter by: fiter summary goes here</span>
        {/* If no filters, display add button instead of toggle button */}
        { state.filters.length > 0 ?  <Button
          id='toggle-filters-btn'
          aria-controls='filters-list'
          aria-expanded={state.filtersExpanded}
          onClick={() => dispatch({type: 'form/filtersToggled'})}
        >Toggle filters</Button>
        : addFilterBtn}
      </div>
      <div className={styles.filterList}>
        
      {state.filters.length > 0 ?
        <ul id='filters-list' className={state.filtersExpanded ? '' : 'hidden'}>
          {state.filters.map((f, index) => 
            <li key={index}>
              <div className={styles.filter}>
                <Select
                  id={`filter-${index}-cat-select`}
                  labelText='Filter by: '
                  value={f.cat_index > -1 ? f.cat_index : 'default'}
                  onChange={(e) => dispatch({type: 'filter/categorySelected', index, categories, value: e.target.value})}
                  defaultOption="Select a category..."
                >
                  {getFilterCatOptions(index, catOptions, state.filters)}
                </Select>
                <Select
                  id={`filter-${index}-type-select`}
                  value={f.include ? 'include' : 'exclude'}
                  onChange={(e) => dispatch({type: 'filter/includeSelected', index, value: e.target.value})}
                  labelText='Type of filter'
                  hideLabel={true}
                >
                  <option value='include'>Include</option>
                  <option value='exclude'>Exclude</option>
                </Select>
                <span>Fields: {f.field_index_list.map((i) => categories[f.cat_index].fields[i].name).join(', ')}</span>
                <Select
                  id={`filter-${index}-fields-select`}
                  value='default'
                  onChange={(e) => dispatch({type: 'filter/fieldSelected', index, categories, value: e.target.value})}
                  disabled={f.cat_index === -1}
                  labelText='Add or remove fields: '
                  hideLabel={true}
                >
                  {getFilterFieldOptions(f, categories)}
                </Select>
                <Button
                  id={`filter-${index}-delete-btn`}
                  icon='delete'
                  iconOnly={true}
                  className="filter-delete-btn"
                  onClick={() => dispatch({type: 'form/filterDeleted', index})}
                  hiddenText="Delete filter"
                />
              </div>
            </li>
          )}
          {/* only include add filter button if there are still categories left for filtering */}
          {getFilterCatOptions(-1, catOptions, state.filters).length ? <li className={styles.addFilterListItem}>{addFilterBtn}</li> : ''}
        </ul>
        : ''}
      </div>
      <hr />
      <div>
        <CustomLink
          href={{pathname: '/home', query: {
            ...props.params,
            sort_by: state.sortIndex !== undefined ? categories[state.sortIndex].id : undefined,
            include: buildFilterParams(true, state.filters, categories),
            exclude: buildFilterParams(false, state.filters, categories),
          }}}
        >Apply filters</CustomLink>
      </div>
    </fieldset>
  )
}