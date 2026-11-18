import { useId, useRef, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { setHomeDesign, useHomeDesign, type HomeDesign } from '../lib/home-design'

export function HomeDesignSwitch() {
  const saved = useHomeDesign()
  const { pathname, search } = useLocation()
  const requested = new URLSearchParams(search).get('home')
  const current = pathname === '/' && (requested === '1' || requested === '2') ? requested : saved
  const navigate = useNavigate()
  const id = useId()
  const group = useRef<HTMLDivElement>(null)

  const select = (design: HomeDesign) => {
    setHomeDesign(design)
    if (pathname !== '/' || current !== design) navigate(`/?home=${design}`)
  }
  const onKey = (event: KeyboardEvent) => {
    let next: HomeDesign
    if (event.key === 'Home') next = '1'
    else if (event.key === 'End') next = '2'
    else if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) next = current === '1' ? '2' : '1'
    else return
    event.preventDefault()
    group.current?.querySelector<HTMLButtonElement>(`[data-design="${next}"]`)?.focus()
    select(next)
  }

  return (
    <div className="seg seg--dark home-design">
      <span className="seg__label" id={id}>Homepage design</span>
      <div ref={group} className="seg__track home-design__track" role="radiogroup" aria-labelledby={id} onKeyDown={onKey}>
        {(['1', '2'] as const).map((design) => (
          <button
            key={design}
            type="button"
            role="radio"
            data-design={design}
            aria-checked={current === design}
            aria-label={`Option ${design}: ${design === '1' ? 'Current' : 'New'} homepage`}
            tabIndex={current === design ? 0 : -1}
            className={`seg__opt${current === design ? ' is-active' : ''}`}
            onClick={() => select(design)}
          >
            <Icon name={design === '1' ? 'grid' : 'sparkle'} size={15} />
            <span>{design} · {design === '1' ? 'Current' : 'New'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
