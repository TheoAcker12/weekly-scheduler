import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { signOut } from 'next-auth/react'

export default function Settings() {
  return (
    <Layout
      current="/settings"
      title="Settings"
    >
      <div>There is nothing here yet.</div>
      <Button
        icon='logout'
        onClick={() => { signOut(); }}
      >Log Out</Button>
    </Layout>
  )
}
