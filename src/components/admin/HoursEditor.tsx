import type { AdminHoursDayFormState } from '../../types/admin'
import {
  addFirstInterval,
  addSecondInterval,
  removeInterval,
  updateIntervalField,
  WEEKDAY_LABELS,
} from '../../utils/admin'

interface HoursEditorProps {
  value: AdminHoursDayFormState[]
  onChange: (hours: AdminHoursDayFormState[]) => void
}

export function HoursEditor({ value, onChange }: HoursEditorProps) {
  return (
    <section className="admin-block">
      <div className="admin-form__header">
        <h3>Horários</h3>
        <p>Dias sem intervalo configurado ficam como não informado.</p>
      </div>

      <div className="admin-hours-grid">
        {value.map((day) => (
          <article key={day.weekday} className="admin-day-card">
            <div className="admin-day-card__header">
              <strong>{WEEKDAY_LABELS[day.weekday]}</strong>
              <div className="admin-row-actions">
                {day.intervals.length === 0 ? (
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => onChange(addFirstInterval(value, day.weekday))}
                  >
                    Adicionar horário
                  </button>
                ) : null}
                {day.intervals.length === 1 ? (
                  <button
                    type="button"
                    className="admin-button admin-button--secondary"
                    onClick={() => onChange(addSecondInterval(value, day.weekday))}
                  >
                    Adicionar 2º intervalo
                  </button>
                ) : null}
              </div>
            </div>

            {day.intervals.length === 0 ? <p className="admin-muted">Não informado</p> : null}

            <div className="admin-intervals">
              {day.intervals.map((interval, intervalIndex) => (
                <div key={`${day.weekday}-${intervalIndex}`} className="admin-interval-row">
                  <label className="admin-field">
                    <span>Abre</span>
                    <input
                      className="admin-input"
                      type="time"
                      value={interval.openTime}
                      onChange={(event) =>
                        onChange(updateIntervalField(value, day.weekday, intervalIndex, 'openTime', event.target.value))
                      }
                    />
                  </label>

                  <label className="admin-field">
                    <span>Fecha</span>
                    <input
                      className="admin-input"
                      type="time"
                      value={interval.closeTime}
                      onChange={(event) =>
                        onChange(updateIntervalField(value, day.weekday, intervalIndex, 'closeTime', event.target.value))
                      }
                    />
                  </label>

                  <div className="admin-interval-row__actions">
                    <button
                      type="button"
                      className="admin-button admin-button--danger"
                      onClick={() => onChange(removeInterval(value, day.weekday, intervalIndex))}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
