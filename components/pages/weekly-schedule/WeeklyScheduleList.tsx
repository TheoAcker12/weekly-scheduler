import { days } from '@/lib/types'

export default function WeeklyScheduleList() {
  return (
    <div>
      {/* These headers are ignored by assistive tech, as the necessary information is provided at more sensible locations elsewhere */}
      <div className="ignore-grid" aria-hidden="true">
        {days.map((day) => <div key={day} className="grid-header">{day}</div>)}
      </div>
    </div>
  )
}