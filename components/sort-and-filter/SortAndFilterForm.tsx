import { Select } from '@/components/ui/Select';
import CustomLink from '@/components/ui/CustomLink';
import styles from '@/styles/filter-form.module.scss'
import { ParsedUrlQuery } from 'querystring';
import { Category } from '@/lib/api_schema';
import { useImmerReducer } from 'use-immer';
import { FilterAction, FilterState, filterReducer } from './filters-reducer';
import { parseSortParam } from '@/lib/utils';

type Props = {
  params: ParsedUrlQuery,
  categories: Category[],
}

export default function SortAndFilterForm({ categories, ...props}: Props) {
  console.log(props.params['sort_by']);
  console.log(parseSortParam(props.params['sort_by'], categories))
  const [state, dispatch] = useImmerReducer<FilterState, FilterAction>(filterReducer,  {
    sortIndex: parseSortParam(props.params['sort_by'], categories),
  });

  // for use populating sort and filter category select options
  const catOptions = categories.map((cat, index) => <option key={index} value={index}>{cat.name}</option>);

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
      </div>
      <div className={styles.filterList}>
      </div>
      <hr />
      <div>
        <CustomLink
          href={{pathname: '/home', query: {
            ...props.params,
            sort_by: state.sortIndex !== undefined ? categories[state.sortIndex].id : undefined,
          }}}
        >Apply filters</CustomLink>
      </div>
    </fieldset>
  )
}