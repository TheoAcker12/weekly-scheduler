import { Select } from '@/components/ui/Select';
import CustomLink from '@/components/ui/CustomLink';
import styles from '@/styles/filter-form.module.scss'
import { ParsedUrlQuery } from 'querystring';

type Props = {
  params: ParsedUrlQuery
}

export default function SortAndFilterForm(props: Props) {
  return (
    <fieldset>
      <legend>Sort and Filter</legend>
      <Select
        className='sort-options'
        id='sort-select'
        labelText='Sort by: '
        defaultOption='Select a category...'
      >
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