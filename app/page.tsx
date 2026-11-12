// Violet homepage — editorial layout (2026-11-12, unpushed).
// Order, top to bottom: arched hero → the three pillars in ONE interlocking
// triptych (Tests / Counselors / Content) → plans immediately after → then the
// full detail sections (content mosaic, tests, counselors cascade).
// Copy, prices, data, buttons, links and behaviour are unchanged.
// Pure presentation; no data or API code touched.
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel } from '@/lib/client';
import { Avatar, ContentCover, TestMark, coverFor } from '@/components/visuals';
import { HERO_IMAGE } from '@/lib/hero';

export default function Home() {
  const { lang } = useLang();
  const [cat, setCat] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => setErr(t(lang, 'loadError'))); }, [lang]);

  const tests = cat?.tests ?? [];
  const testColA = tests.filter((_: any, i: number) => i % 2 === 0);
  const testColB = tests.filter((_: any, i: number) => i % 2 === 1);

  const testCard = (x: any) => (
    <div className="card tinted test-card" key={x.id}>
      <div className="test-head"><TestMark title={x.title} /><span className="test-dots" aria-hidden="true" /></div>
      <div className="card-body"><h3>{x.title}</h3><p className="muted">{x.description}</p>
        <p><span className="price">{priceLabel(x.price_cents)}</span> · {x.question_count} questions</p>
        <Link href={`/tests/${x.id}`} className="btn">{t(lang, 'takeTest')}</Link></div></div>
  );

  const pillarReady = cat && cat.tests[0] && cat.counselors[0] && cat.content[0];

  return (
    <div>
      {/* HERO — tall narrow headline, arched illustration breaking out of the
          frame and sliding under the copy, giant logo watermark, drifting petals. */}
      <section className="hero hero-ed">
        <img src="/logo.svg" className="hero-watermark" alt="" aria-hidden="true" />
        <span className="petal p1" aria-hidden="true" />
        <span className="petal p2" aria-hidden="true" />
        <span className="petal p3" aria-hidden="true" />
        <div className="container hero-ed-grid">
          <div className="hero-ed-copy">
            <p className="hero-eyebrow">{t(lang, 'heroEyebrow')}</p>
            <h1>{t(lang, 'heroTitleMain')} <span className="hero-title-accent">{t(lang, 'heroTitleAccent')}</span></h1>
            <p className="hero-sub">{t(lang, 'heroSub')}</p>
            <div className="hero-actions">
              <Link href="/tests" className="btn">{t(lang, 'takeTest')}</Link>
              <Link href="/counselors" className="btn secondary">{t(lang, 'book')}</Link>
              <Link href="/plans" className="btn teal">{t(lang, 'plans')}</Link>
            </div>
            <p className="hero-trust">{t(lang, 'heroTrust')}</p>
          </div>
          <div className="hero-arch">
            <img src={HERO_IMAGE} alt="" />
            {/* Floating cards — the preview hero's two details, now real:
                the Emotional Intelligence test (id 2, free) and the first
                counselor (Dr. Layla Haddad). They overlap the arch's edges
                and link to the real test / counselor pages. */}
            {cat && cat.tests?.length > 0 && cat.counselors?.length > 0 && (() => {
              const ei = cat.tests.find((x: any) => x.id === 2) || cat.tests.find((x: any) => x.price_cents === 0) || cat.tests[0];
              const c0 = cat.counselors[0];
              return (<>
                <Link href={`/tests/${ei.id}`} className="hero-float-card hero-float-report">
                  <span className="hero-float-eyebrow">{t(lang, 'heroCardReport')}</span>
                  <strong className="hero-float-title">{ei.title}</strong>
                  <span className="muted">{priceLabel(ei.price_cents)} · {ei.question_count} questions</span>
                  <span className="hero-segments" aria-hidden="true"><i className="on" /><i className="on" /><i className="on teal" /><i /></span>
                </Link>
                <div className="hero-float-card hero-float-counselor">
                  <Avatar name={c0.name} />
                  <div className="hero-float-c-body">
                    <strong className="hero-float-title">{c0.name}</strong>
                    <span className="muted">{c0.specialty} · ★ {c0.rating}</span>
                  </div>
                  <Link href={`/counselors/${c0.id}`} className="hero-float-book">{t(lang, 'bookShort')}</Link>
                </div>
              </>);
            })()}
          </div>
        </div>
      </section>

      {/* PILLARS — the second glance: Tests, Counselors and Content together
          in ONE interlocking triptych, not three boxes. A tall dark Tests
          panel anchors the left; the Counselors card overlaps it top-right;
          the Content card tucks in low-right, sliding under the Counselors
          card. One idea — three ways to begin — each with real data and its
          own CTA to its page. The old 4-step path band is retired: the three
          pillars now carry the journey. */}
      <section className="section pillars-sec"><div className="container">
        {err && <div className="notice warn">{err} <button className="btn secondary" onClick={() => location.reload()}>{t(lang, 'retry')}</button></div>}
        {!cat && !err && <p>{t(lang, 'loading')}</p>}
        {pillarReady && (<>
          <div className="ed-head"><span className="sec-index">01</span><h2>{t(lang, 'pillarsHead')}</h2><span className="sec-rule" aria-hidden="true" /></div>
          <p className="pillars-sub">{t(lang, 'pillarsSub')}</p>
          <div className="pillars">
            <article className="pillar pillar-tests">
              <span className="pillar-num" aria-hidden="true">01</span>
              <TestMark title={cat.tests[0].title} />
              <h3>{t(lang, 'tests')}</h3>
              <p className="pillar-item">{cat.tests[0].title}</p>
              <p>{cat.tests[0].description}</p>
              <p><span className="price">{priceLabel(cat.tests[0].price_cents)}</span> · {cat.tests[0].question_count} questions</p>
              <Link href="/tests" className="btn">{t(lang, 'takeTest')}</Link>
            </article>
            <article className="card pillar pillar-counselors">
              <span className="pillar-num" aria-hidden="true">02</span>
              <div className="counselor-top"><Avatar name={cat.counselors[0].name} />
                <div><h3>{cat.counselors[0].name}</h3><p className="muted">{cat.counselors[0].specialty} · ★ {cat.counselors[0].rating} · {cat.counselors[0].sessions_done} sessions</p></div></div>
              <p>{cat.counselors[0].bio}</p>
              <Link href="/counselors" className="btn secondary">{t(lang, 'book')}</Link>
            </article>
            <article className="card media-card pillar pillar-content">
              <span className="pillar-num" aria-hidden="true">03</span>
              <img className="pillar-content-media" src={coverFor(cat.content[0].kind)} alt="" loading="lazy" />
              <div className="card-body"><span className="badge">{cat.content[0].kind}</span> <span className="muted">{cat.content[0].meta}</span>
                <h3>{cat.content[0].title}</h3><p className="muted">{cat.content[0].description}</p>
                <p><span className="price">{priceLabel(cat.content[0].price_cents)}</span></p>
                <Link href="/content" className="btn secondary">{t(lang, 'browseContent')}</Link></div>
            </article>
          </div>
        </>)}
      </div></section>

      {/* PLANS — immediately after the pillars. A deep-plum band: the pricing
          row sits on dark ground, the featured plan rises above the rest. */}
      {cat && (<section className="band-plum"><div className="container">
        <div className="ed-head"><span className="sec-index">02</span><h2>{t(lang, 'plans')}</h2><span className="sec-rule" aria-hidden="true" /><Link href="/plans" className="sec-more" aria-label={t(lang, 'plans')}>→</Link></div>
        <div className="plans-arc">{cat.plans.map((p: any) => (
          <div className={`card plan-card${p.priority ? ' featured' : ''}`} key={p.id}>
            <div className="card-body"><h3>{p.name}</h3>
              <p><span className="price plan-price">${(p.price_cents / 100).toFixed(0)}/mo</span></p>
              <p>{p.sessions} × 45-min sessions + ${(p.credit_cents / 100).toFixed(0)} credit · unlimited messaging</p>
              <p>{p.emergency_calls_per_month > 0 ? `${p.emergency_calls_per_month} ${t(lang, 'emergencyPerMonth')}` : t(lang, 'emergencyNotIncluded')}</p>
              <p className="muted">No tests included — tests are free or paid from credit.</p></div></div>
        ))}</div>
      </div></section>)}

      {/* CONTENT — mosaic: one wide featured card, one card pushed down on the
          right, one tucked in low on the left. */}
      {cat && (<section className="section home-sec"><div className="container">
        <div className="ed-head"><span className="sec-index">03</span><h2>{t(lang, 'content')}</h2><span className="sec-rule" aria-hidden="true" /><Link href="/content" className="sec-more" aria-label={t(lang, 'content')}>→</Link></div>
        <div className="content-mosaic">{cat.content.slice(0, 3).map((c: any, i: number) => i === 0 ? (
          <article className="card media-card content-feature" key={c.id}>
            <img className="content-feature-media" src={coverFor(c.kind)} alt="" loading="lazy" />
            <div className="card-body"><span className="badge">{c.kind}</span> <span className="muted">{c.meta}</span>
              <h3>{c.title}</h3><p className="muted">{c.description}</p>
              <p><span className="price">{priceLabel(c.price_cents)}</span> <Link href={`/content/${c.id}`}>{t(lang, 'buy')}</Link></p></div></article>
        ) : (
          <article className={`card media-card content-small s${i}`} key={c.id}>
            <ContentCover kind={c.kind} />
            <div className="card-body"><span className="badge">{c.kind}</span> <span className="muted">{c.meta}</span>
              <h3>{c.title}</h3><p className="muted">{c.description}</p>
              <p><span className="price">{priceLabel(c.price_cents)}</span> <Link href={`/content/${c.id}`}>{t(lang, 'buy')}</Link></p></div></article>
        ))}</div>
      </div></section>)}

      {/* TESTS — two columns, the second dropped lower: a staggered pair. */}
      {cat && (<section className="tint-band"><div className="container">
        <div className="ed-head"><span className="sec-index">04</span><h2>{t(lang, 'tests')}</h2><span className="sec-rule" aria-hidden="true" /><Link href="/tests" className="sec-more" aria-label={t(lang, 'tests')}>→</Link></div>
        <div className="tests-cols">
          <div className="tests-col">{testColA.map(testCard)}</div>
          <div className="tests-col tests-col-b">{testColB.map(testCard)}</div>
        </div>
      </div></section>)}

      {/* COUNSELORS — a diagonal cascade: each card steps a little lower. */}
      {cat && (<section className="section home-sec"><div className="container">
        <div className="ed-head"><span className="sec-index">05</span><h2>{t(lang, 'counselors')}</h2><span className="sec-rule" aria-hidden="true" /><Link href="/counselors" className="sec-more" aria-label={t(lang, 'counselors')}>→</Link></div>
        <div className="counselors-cascade">{cat.counselors.slice(0, 4).map((c: any) => (
          <div className="card" key={c.id}>
            <div className="counselor-top"><Avatar name={c.name} />
              <div><h3>{c.name}</h3><p className="muted">{c.specialty} · ★ {c.rating} · {c.sessions_done} sessions</p></div></div>
            <p>{c.bio}</p><Link href={`/counselors/${c.id}`} className="btn secondary">{t(lang, 'book')}</Link></div>
        ))}</div>
      </div></section>)}

      <div className="container">
        <p className="diag-note"><strong>Not a diagnosis.</strong> Test reports are guidance and self-discovery, not a medical diagnosis and not a replacement for a licensed counselor.</p>
      </div>
    </div>
  );
}
