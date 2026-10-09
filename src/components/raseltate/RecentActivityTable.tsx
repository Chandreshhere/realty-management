import { ArrowUpRight, ClipboardList } from 'lucide-react'
import { useData } from '../../store/store'
import { useUI } from '../../store/ui'
import { fmtDate } from '../../lib/format'

/** Compact 4-column log; rows open the related lead or property. */
export function RecentActivityTable() {
  const data = useData()
  const ui = useUI()
  const rows = data.activities.slice(0, 7)
  const open = (ref: (typeof rows)[number]['ref']) => ui.open(ref.kind === 'lead' ? { kind: 'lead', id: ref.id } : { kind: 'property', id: ref.id })
  return (
    <article className="rs-card rs-activity">
      <header className="rs-card__head">
        <h2>
          <ClipboardList size={16} strokeWidth={1.6} /> Recent Activity
        </h2>
        <button type="button" className="rs-arrow" aria-label="Open all activity" onClick={() => ui.open({ kind: 'activity' })}>
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </button>
      </header>
      <div className="rs-activity__wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Activity Type</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="is-clickable" onClick={() => open(a.ref)}>
                <td className="tnum">{fmtDate(a.at)}</td>
                <td>
                  <button
                    type="button"
                    className="rs-activity__link"
                    onClick={(e) => {
                      e.stopPropagation()
                      open(a.ref)
                    }}
                  >
                    {a.type}
                  </button>
                </td>
                <td className="rs-activity__desc">{a.description}</td>
                <td className={`rs-activity__status is-${a.status.toLowerCase()}`}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
