interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <label className="sr-only" htmlFor="catalog-search">
        Pesquisar estabelecimentos
      </label>

      <input
        id="catalog-search"
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pesquisar por nome, categoria, tag ou palavra-chave"
        autoComplete="off"
      />

      {value ? (
        <button type="button" className="search-bar__clear" onClick={onClear}>
          Limpar
        </button>
      ) : null}
    </div>
  )
}
