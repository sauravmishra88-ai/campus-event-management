import { useEffect, useMemo, useState } from 'react'
import { api, json, mediaUrl } from './api'

const savedUser = () => {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null') } catch { return null }
}
const prettyRole = role => ({ STUDENT: 'Student', CLUB_MANAGER: 'Club manager', ADMIN: 'Administrator' }[role] || 'Campus member')
const formatDate = value => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Time to be announced'
const localDateTime = value => value ? String(value).slice(0, 16) : ''
const statusTone = status => String(status || '').toLowerCase()

function Icon({ children, className = '' }) { return <span aria-hidden="true" className={`icon ${className}`}>{children}</span> }
function Notice({ notice, onClose }) {
  if (!notice) return null
  return <div className={`notice ${notice.type || 'success'}`} role="status"><span>{notice.text}</span><button aria-label="Dismiss" onClick={onClose}>×</button></div>
}
function EmptyState({ icon = '✳', title, text, action }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{text}</p>{action}</div>
}
function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input {...props} /></label> }
function TextArea({ label, ...props }) { return <label className="field"><span>{label}</span><textarea {...props} /></label> }

function DateTimeField({ label, value, onChange, onConfirm }) {
  return <label className="field"><span>{label}</span><div className="date-time-control"><input type="datetime-local" required value={value} onChange={event => onChange(event.target.value)} /><button type="button" className="button button-soft date-ok" disabled={!value} onClick={onConfirm}>OK</button></div></label>
}

function EventCard({ event, user, clubs, onAction, onNotice }) {
  const [expanded, setExpanded] = useState(false)
  const club = clubs.find(item => item.id === event.clubId)
  const canManage = user?.role === 'ADMIN' || (club?.managerId === user?.id)
  const isFuture = new Date(event.startTime) > new Date()
  return <article className="event-card">
    <div className={`event-cover cover-${(Number(event.id) % 5) + 1}`}>
      {event.imageUrl && <img className="event-cover-photo" src={mediaUrl(event.imageUrl)} alt={`${event.title} promotional`} />}
      <span className="cover-label">{event.category || 'Campus life'}</span>
      <div className="cover-date"><strong>{new Date(event.startTime).toLocaleDateString('en', { day: '2-digit' })}</strong><span>{new Date(event.startTime).toLocaleDateString('en', { month: 'short' })}</span></div>
      <span className="cover-orbit orbit-one" /><span className="cover-orbit orbit-two" />
      <span className="cover-mark">{(event.title || 'E').slice(0, 1).toUpperCase()}</span>
    </div>
    <div className="event-content">
      <div className="card-kicker"><span>{club?.name || `Club #${event.clubId}`}</span><span className={`status-pill ${statusTone(event.status)}`}>{event.status || 'PUBLISHED'}</span></div>
      <h3>{event.title}</h3>
      <p className="event-description">{event.description || 'A new opportunity to make campus memories.'}</p>
      <div className="event-detail"><Icon>◷</Icon><span>{formatDate(event.startTime)}</span></div>
      <div className="event-detail"><Icon>⌖</Icon><span>{event.venue || 'Venue to be announced'}</span></div>
      {expanded && <div className="event-extra"><span>Ends {formatDate(event.endTime)}</span><span>Capacity: {event.capacity}</span><span>Hosted by {club?.name || 'Campus club'}</span></div>}
      <div className="card-actions">
        <button className="text-button" onClick={() => setExpanded(value => !value)}>{expanded ? 'Less info' : 'Event details'} <span>↗</span></button>
        <div className="action-group">
          {(!user || user.role === 'STUDENT') && isFuture && event.status === 'PUBLISHED' && <button className="button button-dark button-small" onClick={() => onAction('register', event)}>Join event <span>↗</span></button>}
          {canManage && <>
            <button className="button button-soft button-small" onClick={() => onAction('editEvent', event)}>Edit</button>
            {event.status !== 'CANCELLED' && <button className="button button-quiet button-small" onClick={() => onAction('cancelEvent', event)}>Cancel</button>}
          </>}
        </div>
      </div>
    </div>
  </article>
}

function ClubCard({ club, user, onAction }) {
  return <article className="club-card">
    <div className="club-symbol">{club.imageUrl ? <img src={mediaUrl(club.imageUrl)} alt={`${club.name} club`} /> : (club.name || 'C').slice(0, 1).toUpperCase()}</div>
    <div className="club-card-heading"><div><span className="eyebrow">CAMPUS COMMUNITY</span><h3>{club.name}</h3></div><span className={`status-pill ${statusTone(club.status)}`}>{user && club.managerId === user.id ? 'YOU MANAGE' : club.status}</span></div>
    <p>{club.description || 'A place to meet people who share your interests.'}</p>
    {(club.clubType || club.branches) && <div className="club-meta">{club.clubType && <span>{club.clubType}</span>}{club.branches && <span>For {club.branches}</span>}</div>}
    <div className="club-card-foot"><span>Started {club.createdAt ? new Date(club.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'recently'}</span>
      {(user?.role === 'ADMIN' || (user && club?.managerId === user.id)) && <div className="action-group">
        <button className="text-button" onClick={() => onAction('editClub', club)}>Edit</button>
        {club.status === 'APPROVED' && <button className="text-button danger-text" onClick={() => onAction('deactivateClub', club)}>Deactivate</button>}
      </div>}
    </div>
  </article>
}

function AuthDialog({ mode, setMode, onClose, onAuthenticated }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const set = key => event => setForm(current => ({ ...current, [key]: event.target.value }))
  const submit = async event => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (mode === 'register') {
        await api('/auth/register', json('POST', form))
        setMode('login')
        setError('Account created. Log in to continue.')
      } else {
        const result = await api('/auth/login', json('POST', { email: form.email, password: form.password }))
        sessionStorage.setItem('accessToken', result.accessToken)
        sessionStorage.setItem('user', JSON.stringify(result.user))
        sessionStorage.setItem('tokenType', result.tokenType || 'Bearer')
        onAuthenticated(result.user)
      }
    } catch (problem) { setError(problem.message) } finally { setBusy(false) }
  }
  return <div className="modal-scrim" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
      <span className="eyebrow">CAMPUSCONNECT ACCOUNT</span><h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : 'Find your people.'}</h2>
      <p className="muted">{mode === 'login' ? 'Log in to make the most of campus.' : 'Create a student account to join events and clubs.'}</p>
      <form className="form-stack" onSubmit={submit}>
        {mode === 'register' && <Field label="Full name" required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" />}
        <Field label="Email address" type="email" required maxLength={150} autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" />
        <label className="field"><span>Password</span><div className="password-wrap"><input type={showPassword ? 'text' : 'password'} required minLength={mode === 'register' ? 8 : undefined} maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} /><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        {error && <p className={`form-message ${error.startsWith('Account created') ? 'positive' : ''}`} role="alert">{error}</p>}
        <button className="button button-dark button-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'} <span>↗</span></button>
      </form>
      <p className="auth-switch">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login') }}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p>
    </section>
  </div>
}

function EventForm({ clubs, user, initial, onSubmit, onCancel, busy }) {
  const availableClubs = useMemo(() => clubs.filter(club => club.status === 'APPROVED' && (user.role === 'ADMIN' || club.managerId === user.id)), [clubs, user])
  const [form, setForm] = useState(() => initial ? { ...initial, startTime: localDateTime(initial.startTime), endTime: localDateTime(initial.endTime) } : { clubId: availableClubs[0]?.id || '', title: '', description: '', category: '', venue: '', startTime: '', endTime: '', capacity: 40 })
  const [confirmedDates, setConfirmedDates] = useState(() => ({ startTime: Boolean(initial?.startTime), endTime: Boolean(initial?.endTime) }))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dateError, setDateError] = useState('')
  const set = key => e => setForm(current => ({ ...current, [key]: e.target.value }))
  const setDate = key => value => { setForm(current => ({ ...current, [key]: value })); setConfirmedDates(current => ({ ...current, [key]: false })); setDateError('') }
  const confirmDate = key => { setConfirmedDates(current => ({ ...current, [key]: true })); setDateError('') }
  const uploadImage = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError(''); setUploading(true)
    try { const body = new FormData(); body.append('file', file); const result = await api('/media/images', { method: 'POST', body }); setForm(current => ({ ...current, imageUrl: result.url })) }
    catch (error) { setUploadError(error.message) } finally { setUploading(false); event.target.value = '' }
  }
  return <form className="editor-form" onSubmit={event => { event.preventDefault(); if (!confirmedDates.startTime || !confirmedDates.endTime) { setDateError('Select a date and time, then press OK for both Starts and Ends.'); return } onSubmit({ ...form, clubId: Number(form.clubId), capacity: Number(form.capacity) }) }}>
    {!initial && <label className="field"><span>Club</span><select required value={form.clubId} onChange={set('clubId')}><option value="">Choose an approved club</option>{availableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label>}
    <Field label="Event title" required maxLength={150} value={form.title} onChange={set('title')} placeholder="e.g. Design Futures: Open Studio" />
    <TextArea label="Description" maxLength={2000} rows={3} value={form.description || ''} onChange={set('description')} placeholder="What should people know?" />
    <div className="form-two"><Field label="Category" required maxLength={100} value={form.category || ''} onChange={set('category')} placeholder="Arts, technology…" /><Field label="Venue" required maxLength={255} value={form.venue || ''} onChange={set('venue')} placeholder="Building / room" /></div>
    <div className="form-two"><DateTimeField label="Starts (date & time)" value={form.startTime} onChange={setDate('startTime')} onConfirm={() => confirmDate('startTime')} /><DateTimeField label="Ends (date & time)" value={form.endTime} onChange={setDate('endTime')} onConfirm={() => confirmDate('endTime')} /></div>
    {dateError && <p className="form-message" role="alert">{dateError}</p>}
    <Field label="Capacity" type="number" min="1" required value={form.capacity} onChange={set('capacity')} />
    <label className="field"><span>Event poster or advertisement photo <small>Optional · JPG, PNG, WEBP or GIF · max 5 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImage} /></label>
    {uploadError && <p className="form-message" role="alert">{uploadError}</p>}
    {form.imageUrl && <div className="image-preview"><img src={mediaUrl(form.imageUrl)} alt="Event poster preview" /><button type="button" className="text-button danger-text" onClick={() => setForm(current => ({ ...current, imageUrl: '' }))}>Remove photo</button></div>}
    <div className="form-footer"><button type="button" className="button button-soft" onClick={onCancel}>Back</button><button className="button button-dark" disabled={busy || uploading}>{uploading ? 'Uploading photo…' : busy ? 'Saving…' : initial ? 'Save changes' : 'Create event'} <span>↗</span></button></div>
  </form>
}

function ClubForm({ initial, onSubmit, onCancel, busy }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [clubType, setClubType] = useState(initial?.clubType || '')
  const [branches, setBranches] = useState(initial?.branches || '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const uploadImage = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError(''); setUploading(true)
    try { const body = new FormData(); body.append('file', file); const result = await api('/media/images', { method: 'POST', body }); setImageUrl(result.url) }
    catch (error) { setUploadError(error.message) } finally { setUploading(false); event.target.value = '' }
  }
  return <form className="editor-form" onSubmit={event => { event.preventDefault(); onSubmit({ name: name.trim(), description: description.trim(), clubType, branches: branches.trim(), imageUrl }) }}>
    <Field label="Club name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Film Society" />
    <div className="form-two"><label className="field"><span>Club type</span><select value={clubType} onChange={event => setClubType(event.target.value)}><option value="">Choose a type</option>{['Academic', 'Arts & culture', 'Technology', 'Sports & fitness', 'Community service', 'Entrepreneurship', 'Other'].map(type => <option key={type}>{type}</option>)}</select></label><Field label="For which branches?" maxLength={500} value={branches} onChange={event => setBranches(event.target.value)} placeholder="e.g. CSE, ECE, all branches" /></div>
    <TextArea label="About the club" maxLength={2000} rows={5} value={description} onChange={event => setDescription(event.target.value)} placeholder="What does the club do? Who can join? What activities do you plan?" />
    <label className="field"><span>Club photo or advertisement <small>Optional · JPG, PNG, WEBP or GIF · max 5 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadImage} /></label>
    {uploadError && <p className="form-message" role="alert">{uploadError}</p>}
    {imageUrl && <div className="image-preview"><img src={mediaUrl(imageUrl)} alt="Club photo preview" /><button type="button" className="text-button danger-text" onClick={() => setImageUrl('')}>Remove photo</button></div>}
    <div className="form-footer"><button type="button" className="button button-soft" onClick={onCancel}>Back</button><button className="button button-dark" disabled={busy || uploading}>{uploading ? 'Uploading photo…' : busy ? 'Saving…' : initial ? 'Save changes' : 'Submit club'} <span>↗</span></button></div>
  </form>
}

export default function App() {
  const [user, setUser] = useState(savedUser)
  const [page, setPage] = useState('events')
  const [authMode, setAuthMode] = useState('')
  const [notice, setNotice] = useState(null)
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [pendingClubs, setPendingClubs] = useState([])
  const [stats, setStats] = useState(null)
  const [eventQuery, setEventQuery] = useState('')
  const [eventCategory, setEventCategory] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [refreshEvents, setRefreshEvents] = useState(0)
  const [refreshClubs, setRefreshClubs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState(false)
  const [editor, setEditor] = useState(null)
  const [editorError, setEditorError] = useState('')
  const [createdDraft, setCreatedDraft] = useState(null)
  const [accessCheck, setAccessCheck] = useState('')

  const flash = (text, type = 'success') => { setNotice({ text, type }); window.clearTimeout(flash.timer); flash.timer = window.setTimeout(() => setNotice(null), 5000) }
  const loadClubs = async () => {
    if (!sessionStorage.getItem('accessToken')) { setClubs([]); return }
    try { setClubs(await api('/clubs')) } catch (error) { flash(error.message, 'error') }
  }
  const loadEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageIndex), size: '9' })
      if (eventQuery.trim()) params.set('title', eventQuery.trim())
      if (eventCategory) params.set('category', eventCategory)
      const result = await api(`/events/published?${params}`)
      setEvents(result.content || [])
      setPageCount(result.totalPages || 0)
    } catch (error) { flash(error.message, 'error') } finally { setLoading(false) }
  }

  useEffect(() => { loadClubs() }, [refreshClubs, user, page]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) return
    api('/auth/me').catch(() => {
      sessionStorage.clear()
      setUser(null)
      flash('Your session expired. Please log in again.', 'error')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = window.setTimeout(loadEvents, 250)
    return () => window.clearTimeout(timer)
  }, [eventQuery, eventCategory, pageIndex, refreshEvents]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user || page !== 'dashboard') return
    if (user.role === 'STUDENT') api('/student/registrations').then(setRegistrations).catch(error => flash(error.message, 'error'))
    if (user.role === 'ADMIN') {
      api('/admin/dashboard').then(setStats).catch(error => flash(error.message, 'error'))
      api('/admin/clubs/pending').then(setPendingClubs).catch(error => flash(error.message, 'error'))
    }
  }, [user, page, refreshClubs])

  const persistUser = nextUser => { setUser(nextUser); sessionStorage.setItem('user', JSON.stringify(nextUser)); setAuthMode(''); flash(`You're signed in as ${prettyRole(nextUser.role).toLowerCase()}.`) }
  const logout = () => { sessionStorage.clear(); setUser(null); setRegistrations([]); setStats(null); setPendingClubs([]); setPage('events'); flash('You have logged out.') }
  const checkRoleAccess = async () => {
    const endpoint = user.role === 'ADMIN' ? '/admin/test' : user.role === 'CLUB_MANAGER' ? '/manager/test' : '/student/test'
    setAccessCheck('Checking…')
    try { setAccessCheck(await api(endpoint)) } catch (error) { setAccessCheck(error.message) }
  }
  const doAction = async (action, item) => {
    if (action === 'editEvent' || action === 'editClub') { setEditor({ type: action, item }); setEditorError(''); return }
    if (action === 'deactivateClub' && !window.confirm(`Deactivate ${item.name}?`)) return
    if (action === 'cancelEvent' && !window.confirm(`Cancel “${item.title}”?`)) return
    if (action === 'register' && !user) { setAuthMode('login'); return }
    try {
      if (action === 'register') { await api(`/events/${item.id}/register`, json('POST', {})); flash('You’re on the list. See you there!'); setRefreshEvents(value => value + 1) }
      if (action === 'cancelRegistration') { await api(`/events/${item.eventId}/cancel-registration`, { method: 'PATCH' }); flash('Your registration has been cancelled.'); setRegistrations(await api('/student/registrations')) }
      if (action === 'approve' || action === 'reject' || action === 'deactivateClub') {
        const method = action === 'deactivateClub' ? 'deactivate' : action
        await api(`/admin/clubs/${item.id}/${method}`, { method: 'PATCH' })
        flash(method === 'approve' ? 'Club approved. Its creator is now assigned as its manager.' : method === 'reject' ? 'Club rejected.' : 'Club deactivated.')
        setRefreshClubs(value => value + 1)
      }
      if (action === 'cancelEvent') { await api(`/events/${item.id}/cancel`, { method: 'PATCH' }); flash('Event cancelled.'); setRefreshEvents(value => value + 1) }
      if (action === 'publishEvent') { const updated = await api(`/events/${item.id}/publish`, { method: 'PATCH' }); setCreatedDraft(null); flash(`${updated.title} is now published.`); setRefreshEvents(value => value + 1) }
    } catch (error) { flash(error.message, 'error') }
  }

  const saveEditor = async data => {
    setWorking(true); setEditorError('')
    try {
      if (editor.type === 'createEvent') {
        const created = await api('/events', json('POST', data))
        setCreatedDraft(created); setEditor(null); flash('Event created as a draft. Publish it when you’re ready.')
      } else if (editor.type === 'editEvent') {
        const { title, description, imageUrl, category, venue, startTime, endTime, capacity } = data
        const update = { title, description, imageUrl, category, venue, startTime, endTime, capacity }
        await api(`/events/${editor.item.id}`, json('PUT', update)); setEditor(null); flash('Event details saved.'); setRefreshEvents(value => value + 1)
      } else if (editor.type === 'createClub') {
        const club = await api('/clubs', json('POST', data)); setEditor(null); flash(`“${club.name}” was submitted for review.`); setRefreshClubs(value => value + 1)
      } else {
        await api(`/clubs/${editor.item.id}`, json('PUT', data)); setEditor(null); flash('Club details saved.'); setRefreshClubs(value => value + 1)
      }
    } catch (error) { setEditorError(error.message) } finally { setWorking(false) }
  }

  const managerClubs = user?.role === 'ADMIN' ? clubs.filter(club => club.status === 'APPROVED') : clubs.filter(club => club.status === 'APPROVED' && club.managerId === user?.id)
  const managedClubs = user ? clubs.filter(club => club.managerId === user.id) : []

  return <div className="app-shell">
    <header className="topbar"><a href="#events" className="brand" onClick={event => { event.preventDefault(); setPage('events') }}><span className="brand-mark">c.</span><span>campus<span className="brand-light">connect</span></span></a>
      <nav className="main-nav" aria-label="Main navigation"><button className={page === 'events' ? 'active' : ''} onClick={() => setPage('events')}>Discover</button><button className={page === 'clubs' ? 'active' : ''} onClick={() => setPage('clubs')}>Clubs</button>{user && <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>{user.role === 'ADMIN' ? 'Admin' : 'My space'}</button>}</nav>
      <div className="top-actions">{user ? <><button className="profile-chip" onClick={() => setPage('dashboard')}><span className="avatar">{user.name?.slice(0, 1) || 'U'}</span><span className="profile-name">{user.name}</span></button><button className="button button-outline top-logout" onClick={logout}>Log out</button></> : <><button className="text-button login-link" onClick={() => setAuthMode('login')}>Log in</button><button className="button button-dark" onClick={() => setAuthMode('register')}>Get started <span>↗</span></button></>}</div>
    </header>

    <main>
      {page === 'events' && <>
        <section className="hero-wrap"><div className="hero-copy"><span className="eyebrow"><span className="live-dot" /> YOUR CAMPUS, CONNECTED</span><h1>Discover events.<br />Join clubs.<br /><span>Make memories.</span></h1><p>Explore campus events, connect with student clubs, and never miss an opportunity to participate.</p><div className="hero-actions"><button className="button button-dark hero-cta" onClick={() => document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth' })}>Explore Events</button><button className="button button-outline" onClick={() => user ? setPage('clubs') : setAuthMode('register')}>{user ? 'Explore Clubs' : 'Join CampusConnect'}</button></div><div className="hero-note">One platform for your entire campus life.</div></div>
          <div className="hero-visual"><div className="hero-illustration"><div className="hero-circle"><span className="hero-emoji">🎓</span></div><div className="floating-card floating-card-one"><span>🎟️</span><div><strong>Something for you</strong><small>Find your next campus moment</small></div></div><div className="floating-card floating-card-two"><span>🌱</span><div><strong>Find your people</strong><small>Make room for something new</small></div></div></div></div>
        </section>
        <section className="content-section event-section" id="event-list"><div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Coming up on campus<span className="heading-dot">.</span></h2><p>Find something you didn’t know you were looking for.</p></div><span className="section-count">{loading ? '…' : `${events.length}${pageCount > 1 ? '+' : ''}`} <small>EVENTS</small></span></div>
          <form className="search-bar" onSubmit={event => { event.preventDefault(); setPageIndex(0); loadEvents() }}><span className="search-icon">⌕</span><input value={eventQuery} onChange={event => { setEventQuery(event.target.value); setPageIndex(0) }} placeholder="Search events, talks, workshops…" aria-label="Search event titles" /><input className="category-search" value={eventCategory} onChange={event => { setEventCategory(event.target.value); setPageIndex(0) }} placeholder="Category" aria-label="Filter by category" /><button className="button button-dark" type="submit">Find events</button></form>
          {loading && !events.length ? <div className="loading-line">Finding what’s happening<span>…</span></div> : events.length ? <div className="event-grid">{events.map(event => <EventCard key={event.id} event={event} user={user} clubs={clubs} onAction={doAction} />)}</div> : <EmptyState icon="◌" title="Nothing on the calendar yet" text="Try a different search, or check back soon. The best plans have a way of showing up." />}
          {pageCount > 1 && <div className="pagination"><button className="button button-soft" disabled={pageIndex === 0} onClick={() => setPageIndex(index => index - 1)}>← Previous</button><span>Page {pageIndex + 1} of {pageCount}</span><button className="button button-soft" disabled={pageIndex + 1 >= pageCount} onClick={() => setPageIndex(index => index + 1)}>Next →</button></div>}
        </section>
        <section className="join-band"><span className="join-icon">✳</span><div><span className="eyebrow">MAKE IT YOURS</span><h2>There’s a place for you here.</h2><p>Meet the people making campus more interesting.</p></div><button className="button button-light" onClick={() => setPage('clubs')}>Explore clubs <span>↗</span></button></section>
      </>}

      {page === 'clubs' && <section className="content-section page-section"><div className="section-heading"><div><span className="eyebrow">FIND YOUR PEOPLE</span><h2>Clubs & communities<span className="heading-dot">.</span></h2><p>From late-night rehearsals to early-morning runs, there’s a crew for that.</p></div>{user?.role === 'STUDENT' && <button className="button button-dark" onClick={() => { setEditor({ type: 'createClub' }); setEditorError('') }}>Start a club <span>↗</span></button>}</div>
        {!user ? <EmptyState icon="⌑" title="Log in to explore campus clubs" text="Sign in to browse approved communities and find the people you’re looking for." action={<button className="button button-dark" onClick={() => setAuthMode('login')}>Log in ↗</button>} /> : clubs.filter(club => club.status === 'APPROVED').length ? <div className="club-grid">{clubs.filter(club => club.status === 'APPROVED').map(club => <ClubCard key={club.id} club={club} user={user} onAction={doAction} />)}</div> : <EmptyState icon="✳" title="Your next community is just getting started" text="There aren’t any approved clubs listed yet. Check back soon or propose a new one." action={user?.role === 'STUDENT' && <button className="button button-dark" onClick={() => setEditor({ type: 'createClub' })}>Propose a club</button>} />}
      </section>}

      {page === 'dashboard' && user && <section className="content-section page-section dashboard-section"><div className="dashboard-welcome"><div><span className="eyebrow">YOUR CAMPUS SPACE</span><h1>{user.role === 'ADMIN' ? 'Campus overview.' : `Hey, ${user.name?.split(' ')[0] || 'there'}.`}</h1><p>{prettyRole(user.role)} · {user.email}</p></div><div className="welcome-mark">{user.name?.slice(0, 1) || 'C'}</div></div>
        <div className="account-access"><span><span className="live-dot" /> API session connected</span><button className="text-button" onClick={checkRoleAccess}>Check {user.role === 'ADMIN' ? 'admin' : user.role === 'CLUB_MANAGER' ? 'manager' : 'student'} access ↗</button>{accessCheck && <small>{accessCheck}</small>}</div>
        {user.role === 'STUDENT' && <>
          <div className="dashboard-heading"><div><span className="eyebrow">YOUR PLANS</span><h2>My registrations</h2></div><button className="button button-soft" onClick={() => setPage('events')}>Browse events ↗</button></div>
          {registrations.length ? <div className="registration-list">{registrations.map(reg => { const event = events.find(item => item.id === reg.eventId); return <article className="registration-row" key={reg.id}><div className="registration-date"><strong>{event?.startTime ? new Date(event.startTime).toLocaleDateString('en', { day: '2-digit' }) : '—'}</strong><span>{event?.startTime ? new Date(event.startTime).toLocaleDateString('en', { month: 'short' }) : 'EVENT'}</span></div><div className="registration-info"><span className="eyebrow">{reg.status} · {reg.registeredAt ? `JOINED ${new Date(reg.registeredAt).toLocaleDateString()}` : 'REGISTERED'}</span><h3>{event?.title || `Event #${reg.eventId}`}</h3><p>{event ? `${formatDate(event.startTime)} · ${event.venue || 'Venue TBA'}` : `Registration reference ${reg.id}`}</p></div>{reg.status === 'REGISTERED' && <button className="button button-soft" onClick={() => doAction('cancelRegistration', reg)}>Cancel registration</button>}</article> })}</div> : <EmptyState icon="◷" title="Your calendar is still open" text="Join an event and you’ll find your plans here." action={<button className="button button-dark" onClick={() => setPage('events')}>Discover events ↗</button>} />}
          {managedClubs.length > 0 && <><div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">YOUR COMMUNITY</span><h2>Clubs you manage</h2></div></div><div className="club-grid">{managedClubs.map(club => <ClubCard key={club.id} club={club} user={user} onAction={doAction} />)}</div></>}
          {managedClubs.length > 0 && <>
            <div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">EVENT PROGRAMMING</span><h2>Events for your club</h2></div><button className="button button-dark" onClick={() => { setEditor({ type: 'createEvent' }); setEditorError('') }}>Create an event <span>↗</span></button></div>
            <p className="dashboard-note">Create an event for one of your approved clubs. It starts as a draft, and you can publish it when it’s ready.</p>
            {createdDraft && <div className="draft-banner"><div><span className="status-pill draft">DRAFT</span><strong>{createdDraft.title}</strong><span>Your event is ready to go live.</span></div><button className="button button-dark button-small" onClick={() => doAction('publishEvent', createdDraft)}>Publish event ↗</button></div>}
          </>}
          <div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">MAKE SOMETHING HAPPEN</span><h2>Bring a club to life</h2></div><button className="button button-dark" onClick={() => { setEditor({ type: 'createClub' }); setEditorError('') }}>Submit a club <span>↗</span></button></div><p className="dashboard-note">Have a group, a big idea, or a shared obsession? Submit it for campus review.</p>
        </>}
        {user.role === 'ADMIN' && <>
          <div className="stat-grid">{stats ? Object.entries({ 'Total students & staff': stats.totalUsers, 'Active accounts': stats.activeUsers, 'Campus clubs': stats.totalClubs, 'Pending approval': stats.pendingClubs, 'Events created': stats.totalEvents, 'Events published': stats.publishedEvents, 'Active registrations': stats.activeRegistrations }).map(([label, value], index) => <article className={`stat-card stat-${index % 4}`} key={label}><span>{label}</span><strong>{value}</strong><small>CampusConnect</small></article>) : <div className="loading-line">Loading campus overview…</div>}</div>
          <div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">EVENT PROGRAMMING</span><h2>Manage campus events</h2></div><button className="button button-dark" onClick={() => { setEditor({ type: 'createEvent' }); setEditorError('') }}>Create an event <span>↗</span></button></div>
          {createdDraft && <div className="draft-banner"><div><span className="status-pill draft">DRAFT</span><strong>{createdDraft.title}</strong><span>Your event is ready to go live.</span></div><button className="button button-dark button-small" onClick={() => doAction('publishEvent', createdDraft)}>Publish event ↗</button></div>}
          <p className="dashboard-note">Publish new events and manage event details from the Discover page.</p>
          <div className="dashboard-heading"><div><span className="eyebrow">NEEDS YOUR EYES</span><h2>Club applications</h2></div><span className="pending-count">{pendingClubs.length} pending</span></div>
          {pendingClubs.length ? <div className="approval-list">{pendingClubs.map(club => <article className="approval-row application-card" key={club.id}>
            <div className="club-symbol small-symbol">{club.name.slice(0, 1)}</div>
            <div className="approval-copy">
              <span className="eyebrow">CLUB APPLICATION · #{club.id}</span>
              <h3>{club.name}</h3>
              <p className="application-preview">{club.description || 'No description provided.'}</p>
              <div className="application-meta-details">{club.clubType && <span><strong>Type</strong> {club.clubType}</span>}{club.branches && <span><strong>Branches</strong> {club.branches}</span>}</div>
              <details className="application-details"><summary>Read full application</summary><p>{club.description || 'No description provided.'}</p>{club.imageUrl && <img className="application-image" src={mediaUrl(club.imageUrl)} alt={`${club.name} application`} />}</details>
              <span className="application-meta">Submitted {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : ''} · Creator #{club.createdById} will be assigned as manager</span>
            </div>
            <div className="action-group application-actions"><button className="button button-dark button-small" onClick={() => doAction('approve', club)}>Approve & assign creator</button><button className="button button-soft button-small" onClick={() => doAction('reject', club)}>Reject</button></div>
          </article>)}</div> : <EmptyState icon="✓" title="All caught up" text="New club applications will show up here for review." />}
          <div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">CAMPUS COMMUNITIES</span><h2>Manage clubs</h2></div></div><div className="club-grid">{clubs.filter(club => club.status !== 'PENDING').map(club => <ClubCard key={club.id} club={club} user={user} onAction={doAction} />)}</div>
        </>}
        {user.role === 'CLUB_MANAGER' && <>
          <div className="dashboard-heading"><div><span className="eyebrow">MAKE A PLAN</span><h2>Events for your club</h2></div><button className="button button-dark" onClick={() => { setEditor({ type: 'createEvent' }); setEditorError('') }}>Create an event <span>↗</span></button></div>
          <p className="dashboard-note">Create events for a club assigned to you. New events start as drafts, ready for publishing.</p>
          {createdDraft && <div className="draft-banner"><div><span className="status-pill draft">DRAFT</span><strong>{createdDraft.title}</strong><span>Your event is ready to go live.</span></div><button className="button button-dark button-small" onClick={() => doAction('publishEvent', createdDraft)}>Publish event ↗</button></div>}
          {!managerClubs.length && <div className="notice info persistent">You don’t have an approved club assigned yet. Ask an administrator to approve and assign a club before creating events.</div>}
          <div className="dashboard-heading club-submit-heading"><div><span className="eyebrow">YOUR CLUBS</span><h2>Approved communities</h2></div></div><div className="club-grid">{managerClubs.length ? managerClubs.map(club => <ClubCard key={club.id} club={club} user={user} onAction={doAction} />) : <EmptyState title="No clubs assigned yet" text="When a club is assigned to you, it’ll appear here." />}</div>
        </>}
      </section>}

      {page === 'dashboard' && !user && <section className="signed-out-panel"><span className="eyebrow">YOUR CAMPUS SPACE</span><h1>Log in to see your dashboard.</h1><p>Keep your registrations, clubs, and campus plans in one place.</p><button className="button button-dark" onClick={() => setAuthMode('login')}>Log in ↗</button></section>}
    </main>

    <footer className="footer"><a href="#events" className="brand" onClick={event => { event.preventDefault(); setPage('events') }}><span className="brand-mark">c.</span><span>campus<span className="brand-light">connect</span></span></a><span>Made for the moments between classes.</span><span>© 2026 CampusConnect</span></footer>
    <Notice notice={notice} onClose={() => setNotice(null)} />
    {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode('')} onAuthenticated={persistUser} />}
    {editor && <div className="modal-scrim" onMouseDown={event => event.target === event.currentTarget && setEditor(null)}><section className="editor-modal" role="dialog" aria-modal="true"><button className="modal-close" aria-label="Close" onClick={() => setEditor(null)}>×</button><span className="eyebrow">{editor.type.includes('Club') ? 'CAMPUS COMMUNITY' : 'CAMPUS EVENT'}</span><h2>{editor.type === 'createEvent' ? 'Create an event.' : editor.type === 'editEvent' ? 'Edit event.' : editor.type === 'createClub' ? 'Start a new club.' : 'Edit club details.'}</h2><p className="muted">{editor.type === 'createEvent' && !managerClubs.length ? 'An administrator must assign an approved club to your account before you can create events.' : 'Add the details and we’ll take it from there.'}</p>
      {editorError && <p className="form-message" role="alert">{editorError}</p>}
      {editor.type.includes('Event') ? <EventForm clubs={clubs} user={user} initial={editor.type === 'editEvent' ? editor.item : null} busy={working} onCancel={() => setEditor(null)} onSubmit={saveEditor} /> : <ClubForm initial={editor.type === 'editClub' ? editor.item : null} busy={working} onCancel={() => setEditor(null)} onSubmit={saveEditor} />}
    </section></div>}
  </div>
}
