import { Select } from '@/components/ui/Select';
import CustomLink from '@/components/ui/CustomLink';
import styles from '@/styles/filter-form.module.scss'
import { ParsedUrlQuery } from 'querystring';
import { Category } from '@/lib/api_schema';
import { useImmerReducer } from 'use-immer';
import { FilterAction, FilterState, filterReducer } from './filters-reducer';

type Props = {
  params: ParsedUrlQuery,
  categories: Category[],
}

export default function SortAndFilterForm({ categories, ...props}: Props) {
  const [state, dispatch] = useImmerReducer<FilterState, FilterAction>(filterReducer,  {});

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
            ...props.params
          }}}
        >Apply filters</CustomLink>
      </div>
    </fieldset>
  )
}