import '../styles/experience.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Accordion, Breadcrumbs } from '../components/ui'
import { useCurrentUser } from '../store'
import { formatINR } from '../data/products'
import { useMeta } from '../lib/hooks'

const TIERS = [
  {
    k: 'circle',
    name: 'Purple Circle',
    entry: 'Free to join',
    line: 'For every Purple family.',
    perks: ['Early access to new collections', 'A birthday surprise for your child', 'Stories and styling notes from the Journal'],
  },
  {
    k: 'plus',
    name: 'Circle Plus',
    entry: 'Annual spend threshold — to be defined',
    line: 'For families who shop with us through the year.',
    perks: ['Everything in Purple Circle', 'Free size exchanges in any store', 'Members-only collection previews'],
  },
  {
    k: 'prive',
    name: 'Circle Privé',
    entry: 'By invitation',
    line: 'Our most personal service.',
    perks: ['Everything in Circle Plus', 'Personal styling appointments', 'First look at limited edits'],
  },
]

const ROWS: { label: string; v: [boolean | string, boolean | string, boolean | string] }[] = [
  { label: 'How to join', v: ['Free sign-up', 'Annual spend [₹ TBD]', 'By invitation'] },
  { label: 'Early access to new collections', v: [true, true, true] },
  { label: 'Birthday surprise', v: [true, true, true] },
  { label: 'Members-only previews', v: [false, true, true] },
  { label: 'Free size exchanges in any store', v: [false, true, true] },
  { label: 'Personal styling appointments', v: [false, false, true] },
  { label: 'First look at limited edits', v: [false, false, true] },
]

function MemberCard({ tier, name }: { tier: (typeof TIERS)[number]; name?: string }) {
  return (
    <div className={`mcard mcard--${tier.k}`} aria-hidden="true">
      <div className="mcard__top">
        <img src={`/img/brand/crest-mark${tier.k === 'circle' ? '' : '-reversed'}.png`} alt="" className="mcard__mark" />
        <span className="mcard__label">Member card</span>
      </div>
      <span className="mcard__tier">{tier.name}</span>
      <div className="mcard__bottom">
        <span>{name ?? 'Your name here'}</span>
        <span>•••• 2027</span>
      </div>
    </div>
  )
}

function PointsExample() {
  const [spend, setSpend] = useState(6000)
  const points = Math.floor(spend / 100)
  return (
    <div className="points">
      <p className="eyebrow">
        Example only <span className="tag tag--gold">Illustrative</span>
      </p>
      <h3 className="h3">How points could add up</h3>
      <label htmlFor="pts-range" className="field__label">
        Spend over a season: <strong>{formatINR(spend)}</strong>
      </label>
      <input id="pts-range" type="range" min={1000} max={30000} step={500} value={spend} onChange={(e) => setSpend(Number(e.target.value))} className="points__range" aria-valuetext={formatINR(spend)} />
      <div className="points__out" aria-live="polite">
        <div>
          <span className="points__n">{points}</span>
          <span className="muted body-sm">points (example: 1 point per ₹100)</span>
        </div>
        <div>
          <span className="points__n">{spend >= 15000 ? 'Circle Plus' : 'Purple Circle'}</span>
          <span className="muted body-sm">{spend >= 15000 ? 'example threshold reached' : `example: ${formatINR(15000 - spend)} to Circle Plus`}</span>
        </div>
      </div>
      <p className="demo-note">The earn rate and the ₹15,000 example threshold are placeholders to show the interaction — not proposed policy.</p>
    </div>
  )
}

export default function PurpleCircle() {
  useMeta('Purple Circle membership (proposed)', 'Purple Circle — a proposed membership that rewards every visit and celebrates every milestone, online and in store.')
  const [t, setT] = useState(0)
  const user = useCurrentUser()
  const tier = TIERS[t]
  const userTier = user ? TIERS.find((x) => x.name === user.tier) ?? TIERS[0] : null
  return (
    <div className="circle-page">
      <section className="pc-hero on-dark">
        <div className="container pc-hero__grid">
          <div className="pc-hero__text">
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Purple Circle' }]} />
            <p className="eyebrow">
              Membership <span className="tag tag--gold pc-hero__tag">Concept · to be confirmed</span>
            </p>
            <h1 className="display">
              Purple <em>Circle.</em>
            </h1>
            <p className="pc-hero__lead">Rewarding every visit. Celebrating every milestone. A membership that grows with your family — online and in every store.</p>
            {user ? (
              <div className="pc-hero__member">
                <p>
                  Welcome back, {user.name.split(' ')[0]}. You’re in <strong>{user.tier}</strong> with <strong>{user.points}</strong> demo points.
                </p>
                <Link to="/account" className="btn btn--ivory">
                  View my membership <Icon name="arrow" size={18} className="icon-arrow" />
                </Link>
              </div>
            ) : (
              <div className="pc-hero__ctas">
                <Link to="/account/register" className="btn btn--ivory">
                  Join free <Icon name="arrow" size={18} className="icon-arrow" />
                </Link>
                <Link to="/account/login" className="link link--light">
                  Already a member? Sign in
                </Link>
              </div>
            )}
          </div>
          <div className="pc-hero__media">
            <img src="/img/brand/gift-card.webp" alt="Concept Purple United gift card and Purple Circle member card" />
          </div>
        </div>
      </section>

      <section className="section pc-tiers" aria-labelledby="tiers-h">
        <div className="container pc-tiers__grid">
          <div className="pc-tiers__card">
            <MemberCard tier={tier} name={user?.name} />
            <p className="signature pc-tiers__line">{tier.line}</p>
          </div>
          <div>
            <p className="eyebrow">Three tiers</p>
            <h2 id="tiers-h" className="h2">
              Choose a tier <em>to preview.</em>
            </h2>
            <div className="pc-tabs" role="tablist" aria-label="Membership tiers">
              {TIERS.map((x, i) => (
                <button key={x.k} type="button" role="tab" id={`tier-tab-${x.k}`} aria-controls="tier-panel" aria-selected={t === i} className={`pc-tab${t === i ? ' is-active' : ''}`} onClick={() => setT(i)}>
                  <Icon name="crown" size={18} />
                  <span>
                    <span className="pc-tab__name">{x.name}</span>
                    <span className="pc-tab__entry">{x.entry}</span>
                  </span>
                </button>
              ))}
            </div>
            <div id="tier-panel" role="tabpanel" aria-labelledby={`tier-tab-${tier.k}`} className="pc-panel" key={tier.k}>
              <ul role="list">
                {tier.perks.map((p) => (
                  <li key={p}>
                    <Icon name="check" size={18} /> {p}
                  </li>
                ))}
              </ul>
              {userTier && userTier.k === tier.k && <p className="tag tag--plum">Your current tier</p>}
            </div>
            <p className="demo-note">Concept · tier names, thresholds and benefits are illustrative and not yet approved.</p>
          </div>
        </div>
      </section>

      <section className="section bg-oat" aria-labelledby="compare-h">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">Compare</p>
              <h2 id="compare-h" className="h2">
                Benefits <em>at a glance.</em>
              </h2>
            </div>
          </div>
          <div className="table-wrap pc-table">
            <table className="table">
              <caption className="sr-only">Purple Circle tier comparison (proposed)</caption>
              <thead>
                <tr>
                  <th scope="col">Benefit</th>
                  {TIERS.map((x, i) => (
                    <th key={x.k} scope="col" className={t === i ? 'is-hl' : ''}>
                      {x.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {r.v.map((v, i) => (
                      <td key={i} className={t === i ? 'is-hl' : ''}>
                        {typeof v === 'string' ? v : v ? (
                          <>
                            <Icon name="check" size={18} className="pc-yes" />
                            <span className="sr-only">Included</span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden="true" className="pc-no">—</span>
                            <span className="sr-only">Not included</span>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how-h">
        <div className="container pc-how">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="how-h" className="h2">
              Simple, <em>by design.</em>
            </h2>
            <ol role="list" className="pc-steps">
              {[
                ['Join free', 'Sign up online or in store — it takes a minute.'],
                ['Shop as you do', 'Online and in any Purple United store, all in one membership.'],
                ['Celebrate together', 'Birthday surprises, early access and previews as you grow with us.'],
              ].map(([h, d], i) => (
                <li key={h}>
                  <span className="pc-steps__n">0{i + 1}</span>
                  <div>
                    <h3 className="h4">{h}</h3>
                    <p className="muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <PointsExample />
        </div>
      </section>

      <section className="section bg-paper" aria-labelledby="pcfaq-h">
        <div className="container container--text">
          <p className="eyebrow">Questions</p>
          <h2 id="pcfaq-h" className="h2" style={{ marginBottom: 24 }}>
            Purple Circle, <em>answered.</em>
          </h2>
          <Accordion
            items={[
              { title: 'Is Purple Circle live today?', body: <p>Not yet. Purple Circle is a proposed programme shown in this redesign concept. Tier names, thresholds and benefits will be confirmed with Purple United before launch.</p> },
              { title: 'Does it cost anything to join?', body: <p>The entry tier, Purple Circle, is proposed as free to join.</p> },
              { title: 'Will it work in stores?', body: <p>Yes — the proposal is one membership across the website and every Purple United store.</p> },
              { title: 'How are Circle Plus and Circle Privé reached?', body: <p>Circle Plus is proposed around an annual spend threshold (to be defined). Circle Privé is proposed as invitation-only.</p> },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
