
import Layout from '@/components/layout/Layout'
import WeeklyScheduleWrapper from '@/components/pages/weekly-schedule/WeeklyScheduleWrapper'

export default function Home() {
  return (
    <Layout
      current="/home"
      title="Weekly Schedule"
    >
      <WeeklyScheduleWrapper />
    </Layout>
  )
}
