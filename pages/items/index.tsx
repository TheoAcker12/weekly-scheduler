import Layout from '@/components/layout/Layout'
import ItemGridWrapper from '@/components/pages/item-grid/ItemGridWrapper'

export default function Items() {
  return (
    <Layout
      current="/items"
      title="Items"
    >
      <ItemGridWrapper />
    </Layout>
  )
}
