import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Price } from './ui'
import { allColorFamilies, formatINR, type Occasion, type Style } from '../data/products'
import { useWishlist } from '../store'
import { addToBag, toggleWish } from '../lib/commerce'
import { useDialog, useLockScroll, useMedia } from '../lib/hooks'
import {
  AGES,
  OCCASIONS,
  STYLES,
  BUDGETS,
  KID_SIZES,
  INFANT_SIZES,
  SHOE_SIZES,
  INFANT_SHOE_SIZES,
  DEFAULT_PREFS,
  isInfant,
  suggestApparel,
  suggestShoe,
  recommend,
  loadPrefs,
  hasSavedPrefs,
  savePrefs,
  clearPrefs,
  summarize,
  ageLabel,
  occasionLabel,
  parseMessage,
  type Prefs,
  type Pick,
  type Look,
} from '../lib/askPurple'

/* ==========================================================================
   Ask Purple — floating stylist chat.
   The same questions, matching rules and suggestions as the /ask-purple page,
   asked one at a time as a conversation. Answer with a tap or type freely
   ("a festive look for my 6 year old daughter under 3000") — the chat reads
   what it can and only asks for what's missing. Rule-based demo, not live AI.
   ========================================================================== */

type Step = 'resume' | 'age' | 'gender' | 'occasion' | 'styles' | 'budget' | 'sizes' | 'apparel' | 'shoe' | 'colors' | 'done'
const ORDER: Step[] = ['age', 'gender', 'occasion', 'styles', 'budget', 'sizes', 'colors']

type Results = { picks: Pick[]; looks: Look[]; total: number; apparel: string; shoe: string; more: boolean }
type Msg = { id: string; from: 'bot' | 'user'; text?: string; results?: Results; empty?: boolean }

let uid = 0
// Time-based prefix keeps ids unique even if this module is reloaded mid-conversation (dev hot reload).
const nextId = () => `${Date.now().toString(36)}-${++uid}`
const PAGE = 6

const GENDERS = [
  { v: 'girl', l: 'A girl' },
  { v: 'boy', l: 'A boy' },
  { v: 'any', l: 'Show me everything' },
] as const

const STARTERS = ['A festive look for my 6 year old daughter', 'Birthday outfit for a 4 year old boy under ₹3,000', 'Cosy everyday pieces for a baby']

function question(step: Step, p: Prefs): string {
  switch (step) {
    case 'resume':
      return `Welcome back. Last time you were shopping for ${summarize(p)}. Shall I pick up from there?`
    case 'age':
      return 'How old are they?'
    case 'gender':
      return 'Who are we shopping for?'
    case 'occasion':
      return 'What’s the occasion?'
    case 'styles':
      return 'How would you describe their style? Choose as many as you like, then tap Done.'
    case 'budget':
      return 'What’s your budget per piece?'
    case 'sizes':
      return `For ${isInfant(p.age) ? `a baby of ${ageLabel(p.age)}` : `a ${p.age}-year-old`} I’d suggest ${p.apparelSize || suggestApparel(p.age)} in clothing and ${p.shoeSize || suggestShoe(p.age)} in shoes, from our general size guide. Shall I use those?`
    case 'apparel':
      return 'Which clothing size do they wear?'
    case 'shoe':
      return 'And their shoe size?'
    case 'colors':
      return 'Any colours they love? Choose a few, or skip.'
    default:
      return 'Anything else? Refine your brief, see more picks or start again.'
  }
}

/** Short human list of what the chat understood from a typed message. */
function understood(patch: Partial<Prefs>) {
  const bits: string[] = []
  if (patch.age) bits.push(ageLabel(patch.age))
  if (patch.gender) bits.push(patch.gender === 'any' ? 'girls or boys' : `a ${patch.gender}`)
  if (patch.occasion) bits.push(occasionLabel(patch.occasion).toLowerCase())
  if (patch.styles?.length) bits.push(`${patch.styles.join(' & ')} style`)
  if (patch.budget !== undefined) bits.push(patch.budget ? `up to ${formatINR(patch.budget)} a piece` : 'no budget limit')
  if (patch.apparelSize) bits.push(`size ${patch.apparelSize}`)
  if (patch.shoeSize) bits.push(`shoe size ${patch.shoeSize}`)
  if (patch.colors?.length) bits.push(patch.colors.join(', ').toLowerCase())
  return bits
}

const join = (b: string[]) => (b.length < 2 ? b.join('') : `${b.slice(0, -1).join(', ')} and ${b[b.length - 1]}`)

/* ---------- Product card inside the chat ---------- */
function ChatPick({ x, onNavigate }: { x: Pick; onNavigate: () => void }) {
  const wished = useWishlist((s) => s.items.some((i) => i.handle === x.p.handle))
  const [busy, setBusy] = useState(false)
  const img = x.p.colors.find((c) => c.name === x.color)!.images[0]
  const href = `/products/${x.p.handle}?color=${encodeURIComponent(x.color)}`
  return (
    <li className="askp-card">
      {/* Duplicate of the name link: pointer-only, hidden from keyboard and screen readers (WCAG 2.4.4). */}
      <Link to={href} className="askp-card__img" tabIndex={-1} aria-hidden="true" onClick={onNavigate}>
        <img src={img} alt="" loading="lazy" />
      </Link>
      <div className="askp-card__body">
        <Link to={href} className="askp-card__name" onClick={onNavigate}>
          {x.p.name}
        </Link>
        <p className="askp-card__meta">
          {x.color} · {x.size}
        </p>
        <Price price={x.p.price} compareAt={x.p.compareAt} className="askp-card__price" />
        <p className="askp-card__why">
          <Icon name="sparkle" size={12} aria-hidden="true" /> {x.reasons[0]}
        </p>
        <div className="askp-card__actions">
          <button
            type="button"
            className={`btn btn--sm${busy ? ' is-loading' : ''}`}
            onClick={() => {
              setBusy(true)
              setTimeout(() => {
                addToBag(x.p.handle, x.color, x.size, 1, { openDrawer: false })
                setBusy(false)
              }, 350)
            }}
          >
            Add<span className="sr-only"> {x.p.name}, size</span> {x.size}
          </button>
          <button
            type="button"
            className={`icon-btn askp-card__wish${wished ? ' is-on' : ''}`}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${x.p.name} from wishlist` : `Save ${x.p.name} to wishlist`}
            onClick={() => toggleWish(x.p.handle, x.color)}
          >
            <Icon name={wished ? 'heart-fill' : 'heart'} size={18} />
          </button>
        </div>
      </div>
    </li>
  )
}

function ChatLook({ look, onAdd, onNavigate }: { look: Look; onAdd: (items: Pick[]) => void; onNavigate: () => void }) {
  const total = look.items.reduce((s, x) => s + x.p.price, 0)
  return (
    <section className="askp-look" aria-label={look.title}>
      <div className="askp-look__head">
        <p className="askp-look__title">{look.title}</p>
        <p className="askp-look__total">
          <span className="sr-only">Look total </span>
          {formatINR(total)}
        </p>
      </div>
      <ul role="list" className="askp-look__strip">
        {look.items.map((x) => (
          <li key={x.p.handle}>
            <Link to={`/products/${x.p.handle}?color=${encodeURIComponent(x.color)}`} className="askp-look__tile" onClick={onNavigate}>
              <img src={x.p.colors.find((c) => c.name === x.color)!.images[0]} alt="" loading="lazy" />
              <span className="sr-only">
                {x.p.name}, {x.color}, size {x.size}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="askp-look__names" aria-hidden="true">
        {look.items.map((x) => x.p.name).join(' · ')}
      </p>
      <button type="button" className="btn btn--sm btn--block" onClick={() => onAdd(look.items)}>
        <Icon name="bag" size={15} /> Add look to bag
      </button>
    </section>
  )
}

/* ---------- The chat ---------- */
export function AskPurpleChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [answered, setAnswered] = useState<Set<Step>>(new Set())
  const [step, setStep] = useState<Step | null>(null)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const shown = useRef(0) // how many ranked picks are on screen for the current brief
  const timers = useRef<number[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const repliesRef = useRef<HTMLDivElement>(null)
  const mobile = useMedia('(max-width: 600px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')

  useDialog(open, panelRef, () => setOpen(false), inputRef)
  useLockScroll(open && mobile)
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 120) : ms))
  }

  /** Bot "types", then posts its lines and waits on the given step. */
  const botSay = (lines: (string | Omit<Msg, 'id' | 'from'>)[], then: Step) => {
    setStep(null)
    setTyping(true)
    later(() => {
      setTyping(false)
      setMsgs((m) => [...m, ...lines.map((l) => ({ id: nextId(), from: 'bot' as const, ...(typeof l === 'string' ? { text: l } : l) }))])
      setStep(then)
    }, 520 + Math.min(900, lines.reduce((n, l) => n + (typeof l === 'string' ? l.length : 80), 0) * 6))
  }

  const results = (p: Prefs, lead: string[] = []) => {
    const rec = recommend(p)
    shown.current = Math.min(PAGE, rec.ranked.length)
    if (!rec.total) {
      botSay([...lead, { text: `Nothing quite fits ${summarize(p)} — yet. Try a higher budget, fewer styles or a different occasion.`, empty: true }], 'done')
      return
    }
    botSay(
      [
        ...lead,
        `Here’s what I found for ${summarize(p)} — ${rec.total} matching ${rec.total === 1 ? 'piece' : 'pieces'} in ${rec.apparelTarget} clothing and ${rec.shoeTarget} shoes. Every pick says why it was chosen.`,
        { results: { picks: rec.all.slice(0, PAGE), looks: rec.looks, total: rec.total, apparel: rec.apparelTarget, shoe: rec.shoeTarget, more: rec.all.length > PAGE } },
      ],
      'done',
    )
  }

  const advance = (p: Prefs, a: Set<Step>, lead: string[] = []) => {
    const nxt = ORDER.find((s) => !a.has(s))
    if (!nxt) return results(p, lead)
    botSay([...lead, question(nxt, p)], nxt)
  }

  const commit = (p: Prefs, a: Set<Step>) => {
    setPrefs(p)
    setAnswered(a)
    savePrefs(p)
  }

  const say = (text: string) => setMsgs((m) => [...m, { id: nextId(), from: 'user', text }])

  /** Apply an answer from a reply chip. */
  const answer = (s: Step, patch: Partial<Prefs>, label: string) => {
    say(label)
    let p = { ...prefs, ...patch }
    const a = new Set(answered)
    if (patch.age && patch.age !== prefs.age) {
      p = { ...p, apparelSize: '', shoeSize: '' }
      a.delete('sizes')
    }
    if (s === 'apparel') {
      commit(p, a)
      return botSay([question('shoe', p)], 'shoe')
    }
    a.add(s === 'shoe' ? 'sizes' : s)
    commit(p, a)
    advance(p, a)
  }

  const start = (fresh = false) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    shown.current = 0
    setMsgs([])
    setDraft('')
    if (fresh) clearPrefs()
    const resume = !fresh && hasSavedPrefs()
    const p = resume ? loadPrefs() : DEFAULT_PREFS
    setPrefs(p)
    setAnswered(new Set())
    botSay(
      [
        'Hello, I’m Ask Purple — your personal stylist. Tell me about the child you’re shopping for and I’ll put together looks from the collection, in their size.',
        resume ? question('resume', p) : 'You can tap an answer or just type, like “a party dress for my 5 year old”. First — how old are they?',
      ],
      resume ? 'resume' : 'age',
    )
  }

  // First open starts the conversation.
  useEffect(() => {
    if (open && !msgs.length && !typing) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Keep the newest message in view: the start of a results block, otherwise the bottom.
  useLayoutEffect(() => {
    const log = logRef.current
    if (!log) return
    const last = log.lastElementChild as HTMLElement | null
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'
    if (last?.classList.contains('askp-msg--results')) log.scrollTo({ top: last.offsetTop - 64, behavior })
    else log.scrollTo({ top: log.scrollHeight, behavior })
  }, [msgs, typing, step, reduced])

  // When a reply chip was used, its group is replaced — move focus to the next set of replies.
  useEffect(() => {
    if (!open || !step) return
    const panel = panelRef.current
    if (panel && (document.activeElement === document.body || !panel.contains(document.activeElement))) {
      ;(repliesRef.current?.querySelector<HTMLElement>('button') ?? inputRef.current)?.focus({ preventScroll: true })
    }
  }, [step, open])

  const closeOnMobile = () => {
    if (mobile) setOpen(false)
  }

  const addLook = (items: Pick[]) => {
    let n = 0
    items.forEach((x) => {
      if (addToBag(x.p.handle, x.color, x.size, 1, { openDrawer: false, silent: true })) n++
    })
    if (n) {
      say('Add this look to my bag')
      botSay([`Done — ${n} ${n === 1 ? 'piece' : 'pieces'} added to your bag in the sizes shown.`], 'done')
    }
  }

  const more = () => {
    const rec = recommend(prefs)
    const from = shown.current
    const picks = rec.all.slice(from, from + PAGE)
    say('Show me more picks')
    if (!picks.length) return botSay(['That’s everything that matches right now. Widen the budget, style or colours to see more.'], 'done')
    shown.current = from + picks.length
    botSay(['A few more you might like:', { results: { picks, looks: [], total: rec.total, apparel: rec.apparelTarget, shoe: rec.shoeTarget, more: rec.all.length > shown.current } }], 'done')
  }

  const refine = (s: Step, label: string) => {
    say(label)
    const a = new Set(answered)
    a.delete(s)
    setAnswered(a)
    botSay([question(s, prefs)], s)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    handleText(draft)
  }

  /** Read a typed message: take what it tells us, then ask only for what's missing. */
  const handleText = (raw: string) => {
    const text = raw.trim()
    if (!text || typing) return
    setDraft('')
    if (/\b(start (over|again)|restart|reset|new search|clear)\b/i.test(text)) {
      say(text)
      return start(true)
    }
    say(text)
    const patch = parseMessage(text)
    const bits = understood(patch)
    const skip = /^\s*(skip|any|anything|none|no( preference)?|not sure|doesn.?t matter|whatever|next)\s*[.!]?\s*$/i.test(text)
    const yes = /^\s*(yes|yeah|yep|sure|ok(ay)?|sounds good|go ahead|use (them|those|these))\b/i.test(text)

    if (!bits.length) {
      if (step === 'resume' && yes) {
        const a = new Set<Step>(ORDER)
        commit(prefs, a)
        return results(prefs)
      }
      if (step === 'resume' && /^\s*(no|nope|start fresh|fresh|new)\b/i.test(text)) {
        commit(DEFAULT_PREFS, new Set())
        return botSay([question('age', DEFAULT_PREFS)], 'age')
      }
      if (step === 'sizes' && yes) {
        const a = new Set(answered).add('sizes')
        commit(prefs, a)
        return advance(prefs, a)
      }
      if (/\b(more|another|other)\b/i.test(text) && step === 'done') return more()
      if (skip && step && step !== 'done' && step !== 'resume') {
        const patchFor: Partial<Prefs> = step === 'occasion' ? { occasion: '' } : step === 'styles' ? { styles: [] } : step === 'colors' ? { colors: [] } : step === 'budget' ? { budget: 0 } : step === 'gender' ? { gender: 'any' } : {}
        const p = { ...prefs, ...patchFor }
        const a = new Set(answered).add(step === 'apparel' || step === 'shoe' ? 'sizes' : step)
        commit(p, a)
        return advance(p, a)
      }
      return botSay(
        [
          step === 'done' || !step
            ? 'I can help with age, who it’s for, the occasion, style, budget, sizes and colours — try “something festive under ₹3,000”, or tap a suggestion below.'
            : `Sorry, I didn’t quite catch that. ${question(step, prefs)}`,
        ],
        step ?? 'done',
      )
    }

    // A typed brief while offered the last one starts a fresh brief.
    const base = step === 'resume' ? DEFAULT_PREFS : prefs
    let p: Prefs = { ...base, ...patch }
    const a = step === 'resume' ? new Set<Step>() : new Set(answered)
    if (patch.age && patch.age !== base.age && !patch.apparelSize && !patch.shoeSize) {
      p = { ...p, apparelSize: '', shoeSize: '' }
      a.delete('sizes')
    }
    if (patch.age) a.add('age')
    if (patch.gender) a.add('gender')
    if (patch.occasion) a.add('occasion')
    if (patch.styles) a.add('styles')
    if (patch.budget !== undefined) a.add('budget')
    if (patch.apparelSize || patch.shoeSize) a.add('sizes')
    if (patch.colors) a.add('colors')
    commit(p, a)
    advance(p, a, [`Got it — ${join(bits)}.`])
  }

  /* ---------- Reply chips for the current step ---------- */
  const multi = (key: 'styles' | 'colors', v: string) =>
    setPrefs((p) => {
      const list = p[key] as string[]
      const n = { ...p, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] }
      savePrefs(n)
      return n
    })

  const replies = (() => {
    if (!step || typing) return null
    switch (step) {
      case 'resume':
        return (
          <>
            <button type="button" className="chip askp-chip--primary" onClick={() => { say('Yes, use my last brief'); const a = new Set<Step>(ORDER); commit(prefs, a); results(prefs) }}>
              Yes, show suggestions
            </button>
            <button type="button" className="chip" onClick={() => { say('Start fresh'); const p = DEFAULT_PREFS; commit(p, new Set()); botSay([question('age', p)], 'age') }}>
              Start fresh
            </button>
          </>
        )
      case 'age':
        return AGES.map((x) => (
          <button key={x.v} type="button" className="chip" onClick={() => answer('age', { age: x.v }, x.l)}>
            {x.l}
          </button>
        ))
      case 'gender':
        return GENDERS.map((g) => (
          <button key={g.v} type="button" className="chip" onClick={() => answer('gender', { gender: g.v }, g.l)}>
            {g.l}
          </button>
        ))
      case 'occasion':
        return (
          <>
            {OCCASIONS.map((o) => (
              <button key={o.v} type="button" className="chip" onClick={() => answer('occasion', { occasion: o.v as Occasion }, o.l)}>
                {o.l}
              </button>
            ))}
            <button type="button" className="chip askp-chip--quiet" onClick={() => answer('occasion', { occasion: '' }, 'Any occasion')}>
              Any occasion
            </button>
          </>
        )
      case 'styles':
        return (
          <>
            {STYLES.map((s) => (
              <button key={s.v} type="button" className="chip" aria-pressed={prefs.styles.includes(s.v)} onClick={() => multi('styles', s.v)}>
                {prefs.styles.includes(s.v) && <Icon name="check" size={14} />}
                {s.l}
              </button>
            ))}
            <button type="button" className="chip askp-chip--primary" onClick={() => answer('styles', { styles: prefs.styles }, prefs.styles.length ? STYLES.filter((s) => prefs.styles.includes(s.v as Style)).map((s) => s.l).join(', ') : 'Any style')}>
              {prefs.styles.length ? 'Done' : 'Any style'}
            </button>
          </>
        )
      case 'budget':
        return BUDGETS.map((b) => (
          <button key={b.v} type="button" className="chip" onClick={() => answer('budget', { budget: b.v }, b.l)}>
            {b.l}
          </button>
        ))
      case 'sizes':
        return (
          <>
            <button type="button" className="chip askp-chip--primary" onClick={() => answer('sizes', {}, 'Yes, use those sizes')}>
              Yes, use those
            </button>
            <button type="button" className="chip" onClick={() => { say('Choose sizes'); botSay([question('apparel', prefs)], 'apparel') }}>
              Choose sizes
            </button>
          </>
        )
      case 'apparel':
        return (
          <>
            <button type="button" className="chip askp-chip--primary" onClick={() => answer('apparel', { apparelSize: '' }, `Suggested: ${suggestApparel(prefs.age)}`)}>
              Suggested: {suggestApparel(prefs.age)}
            </button>
            {(isInfant(prefs.age) ? INFANT_SIZES : KID_SIZES).map((s) => (
              <button key={s} type="button" className="chip" onClick={() => answer('apparel', { apparelSize: s }, s)}>
                {s}
              </button>
            ))}
          </>
        )
      case 'shoe':
        return (
          <>
            <button type="button" className="chip askp-chip--primary" onClick={() => answer('shoe', { shoeSize: '' }, `Suggested: ${suggestShoe(prefs.age)}`)}>
              Suggested: {suggestShoe(prefs.age)}
            </button>
            {(isInfant(prefs.age) ? INFANT_SHOE_SIZES : SHOE_SIZES).map((s) => (
              <button key={s} type="button" className="chip" onClick={() => answer('shoe', { shoeSize: s }, s)}>
                {s}
              </button>
            ))}
          </>
        )
      case 'colors':
        return (
          <>
            {allColorFamilies.map((c) => (
              <button key={c.name} type="button" className="chip askp-swatch" aria-pressed={prefs.colors.includes(c.name)} onClick={() => multi('colors', c.name)}>
                <span style={{ background: c.hex }} aria-hidden="true" />
                {c.name}
              </button>
            ))}
            <button type="button" className="chip askp-chip--primary" onClick={() => answer('colors', { colors: prefs.colors }, prefs.colors.length ? prefs.colors.join(', ') : 'No preference')}>
              {prefs.colors.length ? 'Done' : 'No preference'}
            </button>
          </>
        )
      case 'done': {
        const last = [...msgs].reverse().find((m) => m.from === 'bot')
        if (last?.empty)
          return (
            <>
              {prefs.budget > 0 && (
                <button type="button" className="chip" onClick={() => { say('Remove the budget limit'); const p = { ...prefs, budget: 0 }; commit(p, answered); results(p) }}>
                  Remove budget limit
                </button>
              )}
              {prefs.styles.length > 0 && (
                <button type="button" className="chip" onClick={() => { say('Any style'); const p = { ...prefs, styles: [] }; commit(p, answered); results(p) }}>
                  Any style
                </button>
              )}
              {prefs.occasion && (
                <button type="button" className="chip" onClick={() => { say('Any occasion'); const p = { ...prefs, occasion: '' as const }; commit(p, answered); results(p) }}>
                  Any occasion
                </button>
              )}
              {prefs.colors.length > 0 && (
                <button type="button" className="chip" onClick={() => { say('Any colour'); const p = { ...prefs, colors: [] }; commit(p, answered); results(p) }}>
                  Any colour
                </button>
              )}
              <button type="button" className="chip askp-chip--quiet" onClick={() => { say('Start again'); start(true) }}>
                Start again
              </button>
            </>
          )
        return (
          <>
            <button type="button" className="chip askp-chip--primary" onClick={more}>
              <Icon name="sparkle" size={14} /> More picks
            </button>
            <button type="button" className="chip" onClick={() => refine('occasion', 'Change the occasion')}>
              Occasion
            </button>
            <button type="button" className="chip" onClick={() => refine('budget', 'Change my budget')}>
              Budget
            </button>
            <button type="button" className="chip" onClick={() => refine('styles', 'Change the style')}>
              Style
            </button>
            <button type="button" className="chip" onClick={() => refine('colors', 'Change colours')}>
              Colours
            </button>
            <button type="button" className="chip" onClick={() => refine('age', 'Change their age')}>
              Age
            </button>
            <button type="button" className="chip" onClick={() => refine('sizes', 'Change sizes')}>
              Sizes
            </button>
            <button type="button" className="chip askp-chip--quiet" onClick={() => { say('Start again'); start(true) }}>
              Start again
            </button>
          </>
        )
      }
    }
  })()

  const showStarters = step === 'age' && !answered.size && msgs.length <= 2

  return (
    <div className={`askp${open ? ' is-open' : ''}`}>
      {open && (
        <div className="askp__panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="askp-title">
          <div className="askp__head">
            <span className="askp__avatar" aria-hidden="true">
              <Icon name="sparkle" size={20} />
            </span>
            <div>
              <p className="askp__title" id="askp-title">
                Ask Purple
              </p>
              <p className="askp__sub">
                <span className="askp__dot" aria-hidden="true" /> Your personal stylist
              </p>
            </div>
            <div className="askp__head-actions">
              <button type="button" className="icon-btn" onClick={() => start(true)} aria-label="Start a new conversation" title="Start again">
                <Icon name="return" size={19} />
              </button>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close Ask Purple">
                <Icon name="close" />
              </button>
            </div>
          </div>

          <div className="askp__log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with Ask Purple">
            {msgs.map((m) =>
              m.results ? (
                <div key={m.id} className="askp-msg askp-msg--bot askp-msg--results">
                  {m.results.looks.length > 0 && (
                    <div className="askp-looks">
                      <p className="askp-label">Complete looks</p>
                      {m.results.looks.map((l) => (
                        <ChatLook key={l.title} look={l} onAdd={addLook} onNavigate={closeOnMobile} />
                      ))}
                    </div>
                  )}
                  <p className="askp-label">{m.results.looks.length ? 'Top picks for you' : 'More picks'}</p>
                  <ul role="list" className="askp-cards" aria-label="Suggested pieces">
                    {m.results.picks.map((x) => (
                      <ChatPick key={x.p.handle} x={x} onNavigate={closeOnMobile} />
                    ))}
                  </ul>
                  <Link to="/ask-purple" className="askp-full" onClick={() => { savePrefs(prefs); setOpen(false) }}>
                    See all {m.results.total} on the Ask Purple page <Icon name="arrow" size={15} />
                  </Link>
                </div>
              ) : (
                <p key={m.id} className={`askp-msg askp-msg--${m.from}`}>
                  <span className="sr-only">{m.from === 'bot' ? 'Ask Purple: ' : 'You: '}</span>
                  {m.text}
                </p>
              ),
            )}
            {typing && (
              <p className="askp-msg askp-msg--bot askp-typing" aria-label="Ask Purple is typing">
                <span />
                <span />
                <span />
              </p>
            )}
          </div>

          <div className="askp__foot">
            {replies && (
              <div className="askp__replies" ref={repliesRef} role="group" aria-label={step ? question(step, prefs) : 'Suggestions'}>
                {replies}
              </div>
            )}
            {showStarters && (
              <div className="askp__starters" role="group" aria-label="Or try asking">
                {STARTERS.map((s) => (
                  <button key={s} type="button" className="askp-starter" onClick={() => handleText(s)}>
                    “{s}”
                  </button>
                ))}
              </div>
            )}
            <form className="askp__input" onSubmit={submit}>
              <label htmlFor="askp-input" className="sr-only">
                Message Ask Purple
              </label>
              <input
                id="askp-input"
                ref={inputRef}
                className="askp__field"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your answer or ask anything…"
                autoComplete="off"
                enterKeyHint="send"
              />
              <button type="submit" className="askp__send" aria-label="Send" disabled={!draft.trim() || typing}>
                <Icon name="arrow" size={18} />
              </button>
            </form>
            <p className="askp__note">Demo stylist — simple rules over the catalogue, not live AI.</p>
          </div>
        </div>
      )}
      <button
        type="button"
        className="askp__fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close Ask Purple' : 'Open Ask Purple stylist chat'}
      >
        <span className="askp__fab-icon" aria-hidden="true">
          <Icon name="sparkle" size={18} />
        </span>
        <span className="askp__fab-label">Ask Purple</span>
      </button>
    </div>
  )
}

