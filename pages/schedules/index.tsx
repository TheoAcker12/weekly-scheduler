import Layout from '@/components/layout/Layout'
import ItemGridWrapper from '@/components/pages/item-grid/ItemGridWrapper'

export default function Schedules() {
  return (
    <Layout
      current="/schedules"
      title="Item Schedules"
    >
      <ItemGridWrapper gridType='schedule' />
    </Layout>
  )
}
