import Layout from '@/components/layout/Layout'
import CategoryGrid from '@/components/pages/settings/CategoryGrid';
import { Button } from '@/components/ui/Button'
import { signOut } from 'next-auth/react'

export default function Settings() {
  return (
    <Layout
      current="/settings"
      title="Settings"
    >
      <hr />
      <h2>Categories</h2>
        <CategoryGrid />
      <hr />
      <Button
        icon='logout'
        onClick={() => { signOut(); }}
      >Log Out</Button>
    </Layout>
  )
}
