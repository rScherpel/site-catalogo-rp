interface MonthPickerProps {
  value: string
  onChange: (value: string) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <label className="admin-field">
      <span>Mês</span>
      <input className="admin-input" type="month" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
