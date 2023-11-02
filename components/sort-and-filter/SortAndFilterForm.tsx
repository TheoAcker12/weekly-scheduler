import { Select } from '@/components/ui/Select';
import CustomLink from '@/components/ui/CustomLink';
import styles from '@/styles/filter-form.module.scss'

export default function SortAndFilterForm() {
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
          href={{pathname: '/home'}}
        >Apply filters</CustomLink>
      </div>
    </fieldset>
  )
}