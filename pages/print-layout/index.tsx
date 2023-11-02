import Layout from '@/components/layout/Layout'
import WeeklyScheduleWrapper from '@/components/pages/weekly-schedule/WeeklyScheduleWrapper'

export default function Home() {
  return (
    <Layout
      current="/print-layout"
      title="Weekly Schedule Print Layout"
      hideHeader={true}
    >
      <WeeklyScheduleWrapper listOnly={true} />
    </Layout>
  )
}
