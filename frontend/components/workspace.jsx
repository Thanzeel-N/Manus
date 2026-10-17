"use client";

import BrandLogo from "./brand-logo";
import ThemeToggle from "./theme-toggle";
import UnifiedLogin from "./unified-login";

import { useCallback, useEffect, useRef, useState } from 'react';

const tabs = [
  { id: 'overview', label: 'Overview', mobileLabel: 'Home', icon: 'grid' },
  { id: 'inventory', label: 'Car inventory', mobileLabel: 'Cars', icon: 'car', model: 'car' },
  { id: 'deliveries', label: 'Delivery photos', mobileLabel: 'Deliveries', icon: 'image' },
  { id: 'enquiries', label: 'Contact enquiries', mobileLabel: 'Enquiries', icon: 'mail', model: 'enquiry' },
  { id: 'test-drives', label: 'Test drives', mobileLabel: 'Test drives', icon: 'wheel', model: 'booking' },
  { id: 'slots', label: 'Availability', mobileLabel: 'Slots', icon: 'calendar', model: 'testdriveslot' },
  { id: 'notifications', label: 'Alerts', mobileLabel: 'Alerts', icon: 'mail', admin: true },
  { id: 'staff', label: 'Staff & access', mobileLabel: 'Staff', icon: 'users', admin: true },
  { id: 'account', label: 'My account', icon: 'settings' },
];
const mobilePrimaryTabs = ['overview', 'inventory', 'enquiries', 'test-drives'];
const statuses = { inventory: ['available', 'reserved', 'sold', 'draft'], enquiries: ['new', 'contacted', 'closed'], 'test-drives': ['pending', 'confirmed', 'cancelled'], slots: ['open', 'blocked'] };
const descriptions = {
  overview: 'A little clarity for your busy day. Here’s what’s happening at the showroom.',
  inventory: 'Your collection, beautifully organised. Keep every listing up to date.',
  deliveries: 'Share recent handover moments on the home page. The newest 12 photos stay live.',
  enquiries: 'Turn a first hello into a great customer experience.',
  'test-drives': 'The next step towards their next car. Manage every appointment here.',
  slots: 'Make room for the next visit. All appointment times are in IST.',
  staff: 'The people behind the showroom. Manage your team and their access.',
  notifications: 'Car edits and status changes reported to the owner and administrators.',
  account: 'Your workspace profile and sign-in security.',
};
const date = (value, time = false) => value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: 'numeric', minute: '2-digit' } : {}) }).format(new Date(value)) : '—';
const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
const croreMoney = value => `₹${(Number(value || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
const titleCase = value => value ? value[0].toUpperCase() + value.slice(1) : '';
const can = (user, action, model) => user?.is_admin || user?.permissions.includes(`showroom.${action}_${model}`);
function messageOf(data) {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(messageOf).join(' ');
  return Object.entries(data || {}).map(([key, value]) => `${key === 'detail' || key === 'non_field_errors' ? '' : `${titleCase(key.replaceAll('_', ' '))}: `}${messageOf(value)}`).join(' ');
}
function Icon({ name, size = 20 }) {
  const paths = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    car: 'm5 7 2-3h10l2 3 2 3v8H3v-8l2-3ZM4 10h16M7 14h1m8 0h1M6 18v3m12-3v3',
    image: 'M3 5h18v14H3zM7 14l3-3 3 3 2-2 4 4M8 9h.01',
    mail: 'M3 5h18v14H3z m0 1 9 7 9-7',
    wheel: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3 11h7m4 0h7m-9 3v7',
    calendar: 'M3 5h18v16H3zM7 3v4m10-4v4M3 10h18m-14 5h3m4 0h3',
    users: 'M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2',
    settings: 'm9 3-1 3-3 1v4l2 2-1 3 3 3 3-1 3 1 3-3-1-3 2-2V7l-3-1-1-3ZM14 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    search: 'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM16 16l5 5',
    arrow: 'M5 12h14m-6-6 6 6-6 6', external: 'M7 17 17 7M7 7h10v10', plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6',
    logout: 'M9 4H4v16h5m0-8h12m-4-4 4 4-4 4', check: 'm5 12 4 4L19 6',
    clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
    lock: 'M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3m-4 4v3', refresh: 'M20 10a8 8 0 1 0-1 7M20 4v6h-6',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.grid}/></svg>;
}
function Brand() { return <a href="/dashboard" className="ws-brand" aria-label="Manu’s Car World dashboard"><BrandLogo /><small>SHOWROOM WORKSPACE</small></a>; }
function Badge({ value }) { return <span className={`ws-badge ws-${value}`}><i/>{titleCase(value)}</span>; }
function Avatar({ name }) { return <span className="ws-avatar">{name?.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'M'}</span>; }
function Empty({ icon = 'mail', title = 'Nothing here yet', children }) { return <div className="ws-empty"><span><Icon name={icon} size={27}/></span><h3>{title}</h3><p>{children || 'New records will appear here when they arrive.'}</p></div>; }
function Field({ label, children, wide = false, hint, requirement }) {
  let badge = null;
  if (requirement) {
    const req = String(requirement).trim().toLowerCase();
    if (req === 'required' || req === '*') {
      badge = <span className="ws-required" aria-label="Required" title="Required">*</span>;
    } else if (req === 'optional' || req === '(optional)') {
      badge = <small className="ws-field-requirement">(optional)</small>;
    } else {
      badge = <small className="ws-field-requirement">{requirement}</small>;
    }
  }
  return <label className={`ws-field ${wide ? 'ws-wide' : ''}`}><span>{label}{badge}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function Workspace() {
  const [user, setUser] = useState(null), [booting, setBooting] = useState(true), [bootError, setBootError] = useState('');
  const csrf = useRef('');
  const [section, setSection] = useState('overview'), [overview, setOverview] = useState(null), [data, setData] = useState(null);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [query, setQuery] = useState(''), [status, setStatus] = useState(''), [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0), [modal, setModal] = useState(null), [notice, setNotice] = useState(''), [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const request = useCallback(async (path, options = {}) => {
    const { params, ...fetchOptions } = options;
    const headers = { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(options.method && options.method !== 'GET' ? { 'X-CSRFToken': csrf.current } : {}) };
    const response = await fetch(`/api/workspace/${path}/${params ? `?${new URLSearchParams(params)}` : ''}`, { cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(120000), ...fetchOptions, headers: { ...headers, ...options.headers } });
    let payload;
    try { payload = response.status === 204 ? null : await response.json(); }
    catch { throw new Error('The showroom service is unavailable. Please try again.'); }
    if (!response.ok) {
      if (payload?.detail?.includes('Authentication credentials')) setUser(null);
      throw new Error(messageOf(payload) || 'Unable to complete this action.');
    }
    if (payload?.csrf) csrf.current = payload.csrf;
    return payload;
  }, []);
  const bootstrap = useCallback(async () => {
    setBooting(true); setBootError('');
    try { const result = await request('session'); setUser(result.user); }
    catch (e) { setBootError(e.message); } finally { setBooting(false); }
  }, [request]);
  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => {
    const sync = () => { setData(null); const params = new URLSearchParams(window.location.search); const tab = params.get('section'); const nextSection = tabs.some(t => t.id === tab) ? tab : 'overview'; setSection(nextSection); setQuery(''); setStatus(nextSection === 'inventory' ? params.get('status') || '' : ''); setPage(1); };
    sync(); window.addEventListener('popstate', sync); return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    if (!user) { setOverview(null); setData(null); return; }
    const controller = new AbortController();
    request('overview', { signal: controller.signal }).then(setOverview).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [user, revision, request]);
  useEffect(() => {
    if (!user || ['overview', 'account', 'notifications'].includes(section)) return;
    const controller = new AbortController(); setLoading(true); setError(''); setData(null);
    const timer = setTimeout(async () => {
      try { const result = await request(section, { params: { q: query, status, page }, signal: controller.signal }); if (!controller.signal.aborted) setData(result); }
      catch (e) { if (!controller.signal.aborted) setError(e.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, query ? 220 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [user, section, query, status, page, revision, request]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape); };
  }, [mobileMenuOpen]);
  function navigate(next, nextStatus = '') { setMobileMenuOpen(false); if (next !== section || nextStatus !== status) { setData(null); setLoading(true); } setSection(next); setQuery(''); setStatus(nextStatus); setPage(1); setError(''); setModal(null); const params = new URLSearchParams(); if (next !== 'overview') params.set('section', next); if (next === 'inventory' && nextStatus) params.set('status', nextStatus); window.history.pushState({}, '', `/dashboard${params.size ? `?${params}` : ''}`); }
  function saved(message = 'Changes saved successfully.') { setModal(null); setNotice(message); setRevision(x => x + 1); }
  async function refreshDashboard() {
    try { const session = await request('session'); setUser(session.user); setRevision(x => x + 1); setMobileMenuOpen(false); }
    catch (refreshError) { setError(refreshError.message); }
  }
  async function signOut() {
    setLoggingOut(true);
    try { await request('session', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); setUser(null); setModal(null); setNotice(''); }
    catch (e) { setError(e.message); } finally { setLoggingOut(false); }
  }
  if (booting) return <div className="workspace-app ws-boot"><BrandLogo /><span className="ws-spinner"/><p>Opening your workspace…</p></div>;
  if (!user) return <UnifiedLogin fromWorkspace/>;
  const current = tabs.find(tab => tab.id === section) || tabs[0];
  const visibleTabs = tabs.filter(tab => (!tab.admin || user.is_admin) && (!tab.model || can(user, 'view', tab.model)));
  const accessible = visibleTabs.some(tab => tab.id === section);
  const canEdit = current.model && can(user, 'change', current.model);
  const add = section === 'staff' && user.is_admin ? 'Add staff member' : section === 'slots' && can(user, 'add', 'testdriveslot') ? 'Create a slot' : ['overview', 'inventory'].includes(section) && can(user, 'add', 'car') ? 'Add a car' : null;
  let rows = Array.isArray(data) ? data : data?.results || [];
  if (section === 'staff') rows = rows.filter(person => `${person.username} ${person.first_name} ${person.last_name} ${person.email}`.toLowerCase().includes(query.toLowerCase()) && (!status || String(person.is_active) === status));
  return <div className="workspace-app">
    <aside className={`ws-sidebar${mobileMenuOpen ? ' menu-open' : ''}`}><Brand/><div className="ws-workspace-name"><span className="ws-dot"/> Showroom workspace <Icon name="lock" size={13}/></div><p className="ws-nav-label">MANAGE YOUR SHOWROOM</p><nav id="ws-mobile-menu" aria-label="Workspace navigation"><div className="ws-mobile-menu-head"><div><small>SHOWROOM WORKSPACE</small><strong>More tools</strong></div><button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><Icon name="close" size={20}/></button></div>{visibleTabs.filter(tab => tab.id !== 'account').map(tab => <a href={`/dashboard?section=${tab.id}`} key={tab.id} className={`${section === tab.id ? 'active' : ''}${mobilePrimaryTabs.includes(tab.id) ? ' is-mobile-primary' : ''}`} aria-current={section === tab.id ? 'page' : undefined} onClick={event => { if (!event.metaKey && !event.ctrlKey) { event.preventDefault(); navigate(tab.id); } }}><Icon name={tab.icon}/><span className="ws-tab-label">{tab.label}</span><span className="ws-tab-label-mobile">{tab.mobileLabel || tab.label}</span>{tab.id === 'enquiries' && !!overview?.enquiries?.new && <b>{overview.enquiries.new}</b>}</a>)}<div className="ws-mobile-menu-tools"><ThemeToggle/><button type="button" onClick={refreshDashboard}><Icon name="refresh" size={18}/><span>Refresh dashboard</span></button><button type="button" onClick={signOut} disabled={loggingOut}><Icon name="logout" size={18}/><span>{loggingOut ? 'Signing out…' : 'Sign out'}</span></button></div><button type="button" className="ws-mobile-account" onClick={() => navigate('account')}><Avatar name={user.name}/><span><strong>My account</strong><small>{user.is_admin ? 'Administrator' : 'Staff member'}</small></span><Icon name="settings" size={17}/></button></nav><div className="ws-sidebar-bottom"><div className="ws-tip"><span className="ws-tip-star">✳</span><strong>A great drive starts here.</strong><p>A fresh listing. A quick follow-up.<br/>Small things make a difference.</p><a href="/" target="_blank" rel="noreferrer">View your website <Icon name="external" size={15}/></a></div><button type="button" aria-label="My account" className={section === 'account' ? 'ws-account-link active' : 'ws-account-link'} onClick={() => navigate('account')}><Avatar name={user.name}/><span><strong>{user.name}</strong><small>{user.is_admin ? 'Administrator' : 'Staff member'}</small></span><Icon name="settings" size={17}/></button></div></aside>
    <button type="button" className={`ws-mobile-menu-backdrop${mobileMenuOpen ? ' is-visible' : ''}`} aria-label="Close navigation" tabIndex={mobileMenuOpen ? 0 : -1} onClick={() => setMobileMenuOpen(false)}/>
    <nav className="ws-mobile-bottom-nav" aria-label="Primary workspace navigation">{visibleTabs.filter(tab => mobilePrimaryTabs.includes(tab.id)).map(tab => <a href={`/dashboard?section=${tab.id}`} key={tab.id} className={section === tab.id ? 'active' : ''} aria-current={section === tab.id ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(tab.id); }}><Icon name={tab.icon}/><span>{tab.mobileLabel || tab.label}</span>{tab.id === 'enquiries' && !!overview?.enquiries?.new && <b>{overview.enquiries.new}</b>}</a>)}</nav>
    <div className="ws-content"><header className="ws-topbar"><span className="ws-breadcrumb">Workspace <span>/</span> <strong>{current.label}</strong></span><div className="ws-top-actions"><ThemeToggle/><span className="ws-private"><Icon name="lock" size={13}/> Private workspace</span><button className="ws-icon-button" aria-label="Refresh dashboard" onClick={refreshDashboard}><Icon name="refresh" size={18}/></button><button className="ws-signout" onClick={signOut} disabled={loggingOut}><Icon name="logout" size={17}/>{loggingOut ? 'Signing out…' : 'Sign out'}</button></div><button type="button" className="ws-mobile-menu-trigger" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} aria-controls="ws-mobile-menu" onClick={() => setMobileMenuOpen(open => !open)}><Avatar name={user.name}/></button></header>
    <main className="ws-main"><div className="ws-heading"><div><p className="ws-overline">{section === 'overview' ? 'YOUR DAILY OVERVIEW' : 'MANU’S CAR WORLD / WORKSPACE'}</p><h1>{section === 'overview' ? `Welcome back, ${user.name.split(' ')[0]}.` : current.label}<span>{section === 'overview' ? '✳' : ''}</span></h1><p>{descriptions[section]}</p></div>{add && <button className="ws-button" onClick={() => setModal({ type: section === 'staff' ? 'staff' : section === 'slots' ? 'slots' : 'inventory', item: null })}><Icon name="plus" size={17}/>{add}</button>}</div>
    {notice && <div className="ws-toast" role="status"><Icon name="check" size={18}/>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><Icon name="close" size={16}/></button></div>}
    {error && <div className="ws-error" role="alert">{error}<button onClick={() => setRevision(x => x + 1)}>Try again</button></div>}
    {!accessible ? <Empty icon="lock" title="This section is restricted">Ask your administrator to grant the permissions you need.</Empty> : section === 'overview' ? <Overview data={overview} navigate={navigate} user={user} open={setModal}/> : section === 'notifications' ? <Alerts request={request}/> : section === 'account' ? <Account user={user} request={request} onSaved={saved}/> : section === 'deliveries' ? <DeliveryManager data={data} loading={loading} request={request} setData={setData} notify={setNotice}/> : <>
      {section === 'inventory' && overview?.inventory && <div className="ws-mini-stats">{statuses.inventory.map(value => <button key={value} onClick={() => { setStatus(status === value ? '' : value); setPage(1); }} className={status === value ? 'selected' : ''}><span className={`ws-small-dot ws-${value}`}/>{titleCase(value)}<strong>{overview.inventory[value] || 0}</strong></button>)}<button onClick={() => { setStatus(status === 'featured' ? '' : 'featured'); setPage(1); }} className={status === 'featured' ? 'selected ws-stat-featured' : 'ws-stat-featured'}><span className="ws-small-dot ws-featured"/>★ Featured on Home<strong>{overview.inventory.featured || 0}</strong></button></div>}
      <section className="ws-panel ws-register"><div className="ws-panel-title"><div><h2>{section === 'inventory' ? 'Your collection' : section === 'enquiries' ? 'Customer inbox' : section === 'test-drives' ? 'Booking register' : section === 'slots' ? 'Upcoming availability' : 'Your team'} <span className="ws-count">{data ? (data.count ?? rows.length) : '…'}</span></h2><p>{section === 'slots' ? 'One-hour appointments · 10:00 AM – 5:00 PM IST' : section === 'staff' ? 'Staff can manage daily operations. Only administrators manage accounts.' : 'Live records, always connected to your showroom.'}</p></div><span className="ws-live"><span/> Live</span></div>
      <div className="ws-filters"><label className="ws-search"><Icon name="search" size={18}/><input aria-label={`Search ${current.label.toLowerCase()}`} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder={section === 'inventory' ? 'Search by car, brand or variant…' : section === 'slots' ? 'Search by car name…' : 'Search name, email or phone…'}/></label><select aria-label="Filter by status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{section === 'staff' ? <><option value="true">Active</option><option value="false">Inactive</option></> : section === 'inventory' ? <><option value="featured">★ Featured on Home</option>{statuses.inventory.map(value => <option value={value} key={value}>{titleCase(value)}</option>)}</> : statuses[section]?.map(value => <option value={value} key={value}>{titleCase(value)}</option>)}</select>{(query || status) && <button className="ws-text-button" onClick={() => { setQuery(''); setStatus(''); setPage(1); }}>Reset</button>}</div>
      {loading ? <div className="ws-loading"><span className="ws-spinner"/>Loading {current.label.toLowerCase()}…</div> : !data ? <Empty icon="refresh" title="Records couldn’t be loaded">Try refreshing the dashboard.</Empty> : !rows.length ? <Empty icon={current.icon} title={query || status ? 'No matching records' : `No ${current.label.toLowerCase()} yet`}>{query || status ? 'Try another search or clear your filters.' : section === 'inventory' ? 'Add your first car to start building your collection.' : section === 'slots' ? 'Create a future slot so customers can book a test drive.' : 'New records will appear here when they arrive.'}</Empty> : <RecordTable section={section} rows={rows} canEdit={canEdit} open={setModal}/>}
      <div className="ws-pagination"><span>{section === 'staff' ? `${rows.length} team members` : `Page ${data?.page || 1} of ${data?.pages || 1} · ${data?.count || 0} records`}</span>{section !== 'staff' && <div><button disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button><button disabled={loading || page >= (data?.pages || 1)} onClick={() => setPage(p => p + 1)}>Next →</button></div>}</div></section>
    </>}
    <footer className="ws-footer"><span>Manu’s Car World <span>·</span> Built around your showroom.</span><span>All appointment times in IST <Icon name="clock" size={12}/></span></footer></main></div>
    {modal && <Editor key={`${modal.type}-${modal.item?.id || 'new'}`} type={modal.type} item={modal.item} user={user} request={request} onClose={() => setModal(null)} onSaved={saved}/>}
  </div>;
}

function Overview({ data, navigate, user, open }) {
  if (!data) return <div className="ws-loading"><span className="ws-spinner"/>Loading your showroom…</div>;
  const cards = [
    data.inventory && { label: 'Available cars', value: data.inventory.available || 0, icon: 'car', note: `${Object.values(data.inventory).reduce((a, b) => a + b, 0)} vehicles in your collection`, tab: 'inventory' },
    data.enquiries && { label: 'New enquiries', value: data.enquiries.new || 0, icon: 'mail', note: 'Conversations waiting to happen', tab: 'enquiries' },
    data.bookings && { label: 'Pending test drives', value: data.bookings.pending || 0, icon: 'wheel', note: 'Ready for your confirmation', tab: 'test-drives' },
    data.inventory && (user.is_admin || user.is_owner) && data.stock_value != null && { label: 'Available stock value', value: croreMoney(data.stock_value), icon: 'grid', note: 'Total listed price · INR crore', tab: 'inventory' },
  ].filter(Boolean);
  const totalStock = statuses.inventory.reduce((total, value) => total + (data.inventory?.[value] || 0), 0);
  const featuredCars = data.featured_cars || [];
  return <><div className="ws-stat-grid">{cards.map((card, index) => <button className={`ws-stat-card ${index === 0 ? 'ws-highlight' : ''}`} key={card.label} onClick={() => navigate(card.tab)}><div><span>{card.label}</span><span className="ws-stat-icon"><Icon name={card.icon} size={20}/></span></div><strong>{card.value}</strong><small>{card.note}<Icon name="external" size={15}/></small></button>)}</div>
  <div className="ws-overview-grid"><section className="ws-panel ws-appointments"><div className="ws-panel-title"><div><h2>Coming up next</h2><p>Your upcoming test-drive appointments</p></div>{data.bookings && <button className="ws-text-button" onClick={() => navigate('test-drives')}>View all <Icon name="arrow" size={15}/></button>}</div>{!data.bookings ? <Empty icon="lock" title="Appointments are restricted">Ask your administrator for access to bookings.</Empty> : !data.upcoming.length ? <Empty icon="calendar" title="A little room on the calendar">Upcoming test drives will appear here as customers book their visits.</Empty> : data.upcoming.map(item => <button className="ws-appointment-row" key={item.id} onClick={() => open({ type: 'test-drives', item })}><span className="ws-date-tile"><strong>{new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', day: '2-digit' }).format(new Date(item.starts_at))}</strong><small>{new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', month: 'short' }).format(new Date(item.starts_at))}</small></span><span className="ws-activity-copy"><strong>{item.car_name}</strong><small>{item.name} · {date(item.starts_at, true)} IST</small></span><Badge value={item.status}/></button>)}</section>
  {data.inventory && <section className="ws-panel ws-stock-panel"><div className="ws-panel-title"><div><h2>Collection snapshot</h2><p>Every car, accounted for</p></div><Icon name="car" size={20}/></div><div className="ws-stock-total"><strong>{totalStock}</strong><span>cars in your<br/>collection</span><button className="ws-icon-button" aria-label="View collection" onClick={() => navigate('inventory')}><Icon name="external"/></button></div><div className="ws-stock-bar" role="img" aria-label={statuses.inventory.map(s => `${data.inventory[s] || 0} ${s}`).join(', ')}>{statuses.inventory.map(value => <span key={value} className={`ws-bar-${value}`} style={{ flex: data.inventory[value] || 0 }}/>)}</div><div className="ws-stock-legend">{statuses.inventory.map(value => <button key={value} onClick={() => navigate('inventory', value)}><span className={`ws-small-dot ws-${value}`}/>{titleCase(value)}<strong>{data.inventory[value] || 0}</strong></button>)}<button className="ws-featured-legend" onClick={() => navigate('inventory', 'featured')}><span className="ws-small-dot ws-featured"/>Featured<strong>{data.inventory.featured || 0} / 3</strong></button></div><div className="ws-featured-preview"><div className="ws-featured-preview-title"><span><strong>Featured cars</strong><small>Shown on the home page · maximum 3</small></span><button className="ws-text-button" onClick={() => navigate('inventory', 'featured')}>Manage <Icon name="arrow" size={14}/></button></div>{featuredCars.length ? featuredCars.map(item => <button className="ws-featured-car" key={item.id} onClick={() => open({ type: 'inventory', item })}>{item.images?.[0] ? <img src={item.images[0].image} alt=""/> : <span className="ws-car-placeholder"><Icon name="car" size={20}/></span>}<span><strong>{item.name}</strong><small>{item.year} · {item.variant || item.brand}</small></span><strong>{money(item.price)}</strong><Icon name="external" size={14}/></button>) : <p className="ws-featured-empty">No featured cars yet. Open a car and choose “Show in featured collection”.</p>}</div></section>}
  </div>
  <div className="ws-overview-grid ws-lower-grid">{data.enquiries && <section className="ws-panel"><div className="ws-panel-title"><div><h2>Latest conversations</h2><p>A first hello. A new possibility.</p></div><button className="ws-text-button" onClick={() => navigate('enquiries')}>View all <Icon name="arrow" size={15}/></button></div>{!data.recent_enquiries.length ? <Empty icon="mail" title="Your inbox is ready">Website enquiries will arrive here automatically.</Empty> : data.recent_enquiries.map(item => <button className="ws-enquiry-row" key={item.id} onClick={() => open({ type: 'enquiries', item })}><Avatar name={item.name}/><span className="ws-activity-copy"><strong>{item.name}</strong><small>{item.interest}</small></span><Badge value={item.status}/><Icon name="external" size={16}/></button>)}</section>}
  <section className="ws-quick-card"><span className="ws-quick-star">✳</span><p className="ws-overline">MAKE A LITTLE PROGRESS</p><h2>Ready for the <br/>next great drive?</h2><p>Keep the collection fresh and make every customer feel looked after.</p><div>{can(user, 'add', 'car') && <button onClick={() => open({ type: 'inventory', item: null })}><Icon name="plus" size={16}/> Add a new car <Icon name="arrow" size={16}/></button>}{can(user, 'add', 'testdriveslot') && <button onClick={() => open({ type: 'slots', item: null })}><Icon name="calendar" size={16}/> Schedule availability <Icon name="arrow" size={16}/></button>}<a href="/" target="_blank" rel="noreferrer"><Icon name="external" size={16}/> Visit your public website <Icon name="arrow" size={16}/></a></div></section></div></>;
}

function DeliveryManager({ data, loading, request, setData, notify }) {
  const [files, setFiles] = useState([]), [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const input = useRef(null);
  const photos = data?.results || [];

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  function choose(event) {
    const selected = [...event.target.files];
    if (selected.length > 12) {
      setError('Choose no more than 12 photos at one time.');
      event.target.value = '';
      setFiles([]);
      return;
    }
    setError('');
    setFiles(selected);
  }

  async function upload(event) {
    event.preventDefault();
    if (!files.length) return;
    setBusy(true); setError('');
    const body = new FormData();
    files.forEach(file => body.append('photos', file));
    try {
      const result = await request('deliveries', { method: 'POST', body });
      setData(result); setFiles([]); if (input.current) input.current.value = '';
      notify(`${result.count} delivery photo${result.count === 1 ? '' : 's'} now live on the home page.`);
    } catch (uploadError) { setError(uploadError.message); }
    finally { setBusy(false); }
  }

  async function remove(photo) {
    if (!window.confirm('Remove this delivery photo from the home page?')) return;
    setBusy(true); setError('');
    try {
      await request(`deliveries/${photo.id}`, { method: 'DELETE' });
      setData(current => ({ ...current, results: current.results.filter(item => item.id !== photo.id), count: current.count - 1 }));
      notify('Delivery photo removed from the home page.');
    } catch (removeError) { setError(removeError.message); }
    finally { setBusy(false); }
  }

  if (loading || !data) return <div className="ws-loading"><span className="ws-spinner"/>Loading delivery photos…</div>;
  return <section className="ws-panel ws-delivery-manager">
    <div className="ws-panel-title"><div><h2>Homepage delivery gallery <span className="ws-count">{photos.length} / 12</span></h2><p>Hidden automatically when empty. New uploads replace the oldest photos after the gallery reaches 12. Use Remove on any photo to delete only that image.</p></div><span className="ws-live"><span/> Live</span></div>
    {error && <div className="ws-error" role="alert">{error}</div>}
    <form className="ws-delivery-upload" onSubmit={upload}>
      <Field label="Add delivery photos" hint="Select multiple JPG, PNG or WebP images. They are converted to WebP automatically. Maximum 12 live photos.">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choose}/>
      </Field>
      {!!previews.length && <div className="ws-delivery-preview">{previews.map((url, index) => <img key={url} src={url} alt={`Selected delivery photo ${index + 1}`}/>)}</div>}
      <button className="ws-button" disabled={busy || !files.length}>{busy ? 'Uploading…' : `Publish ${files.length || ''} photo${files.length === 1 ? '' : 's'}`}<Icon name="arrow" size={17}/></button>
    </form>
    {!photos.length ? <Empty icon="image" title="No delivery photos are live">Upload photos above to activate the delivery section on the home page.</Empty> : <div className="ws-delivery-library">{photos.map((photo, index) => <article key={photo.id} className={photo.height > photo.width ? 'is-portrait' : 'is-landscape'}><img src={photo.image} alt={`Delivery photo ${index + 1}`}/><span>{index === 0 ? 'Newest' : `#${index + 1}`}</span><button type="button" aria-label={`Remove only delivery photo ${index + 1}`} disabled={busy} onClick={() => remove(photo)}><Icon name="close" size={13}/><span>Remove</span></button></article>)}</div>}
  </section>;
}

function RecordTable({ section, rows, canEdit, open }) {
  const columns = { inventory: ['Vehicle', 'Specifications', 'Price', 'Availability', ''], enquiries: ['Customer', 'Interested in', 'Received', 'Status', ''], 'test-drives': ['Customer', 'Appointment', 'Reference', 'Status', ''], slots: ['Vehicle', 'Appointment · IST', 'Booking', 'Availability', ''], staff: ['Team member', 'Username', 'Role', 'Access', ''] };
  return <div className="ws-table-scroll"><table className="ws-table"><thead><tr>{columns[section].map((label, i) => <th key={i} scope="col">{label || <span className="ws-sr-only">Actions</span>}</th>)}</tr></thead><tbody>{rows.map(item => <tr key={item.id}>
  {section === 'inventory' ? <><td><div className="ws-vehicle">{item.images?.[0] ? <img src={item.images[0].image} alt={item.name} width="84" height="60"/> : <span className="ws-car-placeholder"><Icon name="car" size={27}/></span>}<span><strong>{item.name}</strong><small>{item.variant || item.brand}{item.is_featured && <span className="ws-featured-pill"> · ★ Featured</span>}{item.is_sample && ' · Sample'}</small></span></div></td><td>{item.year} · {item.fuel}<small>{Number(item.mileage).toLocaleString('en-IN')} km · {item.transmission}</small></td><td><strong className="ws-price">{money(item.price)}</strong><small>Listed price</small></td><td><Badge value={item.status}/>{item.is_featured && <span className="ws-featured-star" title="Featured on home page">★</span>}</td></> : section === 'enquiries' ? <><td><div className="ws-person"><Avatar name={item.name}/><span><strong>{item.name}</strong><small>{item.phone}</small></span></div></td><td><strong>{item.interest}</strong><small className="ws-excerpt">{item.message || 'No additional message'}</small></td><td>{date(item.created_at)}<small>{item.date ? `Preferred: ${date(item.date)}` : 'Callback date not specified'}</small></td><td><Badge value={item.status}/></td></> : section === 'test-drives' ? <><td><div className="ws-person"><Avatar name={item.name}/><span><strong>{item.name}</strong><small>{item.phone}</small></span></div></td><td><strong>{item.car_name}</strong><small>{date(item.starts_at, true)} IST</small></td><td><span className="ws-reference" title={item.reference}>#{item.reference.slice(0, 8).toUpperCase()}</span><small>{item.email_verified_at ? '✓ Email verified' : 'Email not verified'}</small></td><td><Badge value={item.status}/></td></> : section === 'slots' ? <><td><div className="ws-person"><span className="ws-slot-icon"><Icon name="car"/></span><strong>{item.car_name}</strong></div></td><td><strong>{date(item.starts_at, true)}</strong><small>One-hour appointment</small></td><td><Badge value={item.booked ? 'booked' : 'unbooked'}/></td><td><Badge value={item.blocked ? 'blocked' : 'open'}/></td></> : <><td><div className="ws-person"><Avatar name={item.first_name || item.username}/><span><strong>{`${item.first_name} ${item.last_name}`.trim() || item.username}</strong><small>{item.email || 'No email added'}</small></span></div></td><td>{item.username}<small>{item.last_login ? `Last login: ${date(item.last_login)}` : 'Hasn’t signed in yet'}</small></td><td><span className="ws-role"><Icon name={item.is_superuser ? 'lock' : 'users'} size={13}/>{item.is_superuser ? 'Owner' : item.is_admin ? 'Administrator' : 'Staff member'}</span></td><td><Badge value={item.is_active ? 'active' : 'inactive'}/></td></>}
  <td><button className="ws-row-action" onClick={() => open({ type: section, item })}>{section === 'staff' ? item.is_superuser ? 'View profile' : 'Manage' : canEdit ? section === 'enquiries' ? 'Follow up' : section === 'test-drives' ? 'Review' : 'Edit' : 'View'}<Icon name="external" size={14}/></button></td></tr>)}</tbody></table></div>;
}

function Editor({ type, item, user, request, onClose, onSaved }) {
  const ref = useRef(null), [busy, setBusy] = useState(false);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  const titles = { inventory: item ? 'Edit car' : 'Add a new car', enquiries: 'Enquiry details', 'test-drives': 'Test-drive details', slots: item ? 'Manage appointment slot' : 'Create an appointment slot', staff: item ? 'Team member details' : 'Add a staff member' };
  return <dialog ref={ref} className="ws-dialog" aria-labelledby="ws-editor-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === ref.current && !busy) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}><div className="ws-dialog-header"><div><p className="ws-overline">SHOWROOM WORKSPACE</p><h2 id="ws-editor-title">{titles[type]}</h2></div><button className="ws-icon-button" aria-label="Close details" disabled={busy} onClick={onClose}><Icon name="close"/></button></div>{type === 'inventory' ? <CarEditor item={item} user={user} request={request} onSaved={onSaved} busy={busy} setBusy={setBusy}/> : type === 'staff' ? <StaffEditor item={item} user={user} request={request} onSaved={onSaved} busy={busy} setBusy={setBusy}/> : type === 'slots' ? <SlotEditor item={item} user={user} request={request} onSaved={onSaved} busy={busy} setBusy={setBusy}/> : <CustomerEditor type={type} item={item} user={user} request={request} onSaved={onSaved} busy={busy} setBusy={setBusy}/>}</dialog>;
}

function CarEditor({ item, user, request, onSaved, busy, setBusy }) {
  const [error, setError] = useState(''), [record, setRecord] = useState(item), [photos, setPhotos] = useState([]), [previews, setPreviews] = useState([]);
  const [slug, setSlug] = useState(item?.slug || ''), [slugEdited, setSlugEdited] = useState(!!item);
  const editable = can(user, item ? 'change' : 'add', 'car');
  useEffect(() => { const urls = photos.map(file => URL.createObjectURL(file)); setPreviews(urls); return () => urls.forEach(URL.revokeObjectURL); }, [photos]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget);
    if (!form.get('video')?.size) form.delete('video');
    form.set('is_sample', form.get('is_sample') === 'on' ? 'true' : 'false');
    form.set('is_featured', form.get('is_featured') === 'on' ? 'true' : 'false');
    let savedRecord;
    try {
      savedRecord = await request(`inventory${record ? `/${record.id}` : ''}`, { method: record ? 'PATCH' : 'POST', body: form });
      setRecord(savedRecord);
      if (photos.length) { const upload = new FormData(); photos.forEach(file => upload.append('photos', file)); await request(`inventory/${savedRecord.id}/photos`, { method: 'POST', body: upload }); }
      onSaved(item ? 'Car details updated.' : 'Your new car has been added to the collection.');
    } catch (e) { setError(savedRecord ? `Car details saved, but photos could not be uploaded. ${e.message} You can retry below.` : e.message); }
    finally { setBusy(false); }
  }
  async function removePhoto(photo) {
    setBusy(true); setError('');
    try { await request(`inventory/${record.id}/photos/${photo.id}`, { method: 'DELETE' }); setRecord(current => ({ ...current, images: current.images.filter(x => x.id !== photo.id) })); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function deleteCar() {
    if (!record || !window.confirm(`Delete ${record.name}? This permanently removes the car and its photos.`)) return;
    setBusy(true); setError('');
    try { await request(`inventory/${record.id}`, { method: 'DELETE' }); onSaved('Car deleted from the collection.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="ws-editor-form">{error && <div className="ws-error" role="alert">{error}</div>}<p className="ws-form-note">Fields marked with * are required. Choose Featured to place this car in the three-car home-page selection.</p><fieldset disabled={!editable || busy}><h3>01 <span>The essentials</span></h3><div className="ws-form-grid"><Field requirement="Required" label="Car name" wide><input name="name" defaultValue={item?.name} required maxLength={160} placeholder="e.g. BMW 3 Series" onChange={event => { if (!slugEdited) setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}/></Field><Field requirement="Required" label="Brand"><input name="brand" defaultValue={item?.brand} required maxLength={80} placeholder="e.g. BMW"/></Field><Field requirement="Optional" label="Variant"><input name="variant" defaultValue={item?.variant} maxLength={160} placeholder="e.g. 320d Luxury Line"/></Field><Field requirement="Required" label="Listing URL slug" wide hint="Unique address for this car on your website."><input name="slug" value={slug} onChange={event => { setSlugEdited(true); setSlug(event.target.value); }} required maxLength={50} pattern="[a-zA-Z0-9_-]+"/></Field><Field requirement="Required" label="Price (₹ lakh)"><input name="price" type="number" min="0" max="999999.99" step="0.01" defaultValue={item?.price} placeholder="32.50" required/></Field><Field requirement="Required" label="Availability"><select required name="status" defaultValue={item?.status || 'draft'}>{statuses.inventory.map(value => <option value={value} key={value}>{titleCase(value)}</option>)}</select></Field></div><h3>02 <span>Specifications</span></h3><div className="ws-form-grid"><Field requirement="Required" label="Year"><input name="year" type="number" min="1900" max="2100" defaultValue={item?.year || new Date().getFullYear()} required/></Field><Field requirement="Required" label="Mileage (km)"><input name="mileage" type="number" min="0" step="1" defaultValue={item?.mileage || 0} required/></Field>{[['fuel', 'Fuel type', ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']], ['transmission', 'Transmission', ['Automatic', 'Manual']], ['body', 'Body type', ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'MPV']], ['condition', 'Condition', ['Used', 'New']]].map(([name, label, options]) => <Field label={label} requirement="Required" key={name}><select required name={name} defaultValue={item?.[name] || options[0]}>{options.map(value => <option key={value}>{value}</option>)}</select></Field>)}<Field requirement="Optional" label="Description" wide><textarea name="description" defaultValue={item?.description} rows={4} placeholder="Tell customers what makes this car a great choice."/></Field><Field requirement="Optional" label="Features" wide hint="One feature per line."><textarea name="features" defaultValue={item?.features} rows={4} placeholder={'Sunroof\nReverse camera\nLeather seats'}/></Field><label className="ws-checkbox ws-wide ws-featured-option"><input name="is_featured" type="checkbox" defaultChecked={item?.is_featured || false}/><span><strong>★ Feature this car</strong><small>Show its details on the home page. You can select up to 3 cars.</small></span></label><label className="ws-checkbox ws-wide"><input name="is_sample" type="checkbox" defaultChecked={item?.is_sample || false}/> Illustrative sample listing (optional)</label></div><h3>03 <span>Photos & walkaround</span></h3>{!!record?.images?.length && <div className="ws-photo-grid">{record.images.map((photo, index) => <div key={photo.id}><img src={photo.image} alt={photo.caption || `Car photo ${index + 1}`}/>{index === 0 && <span>Cover</span>}{can(user, 'delete', 'carimage') && <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removePhoto(photo)}><Icon name="close" size={14}/></button>}</div>)}</div>}{can(user, 'add', 'carimage') && <Field requirement="Optional" label="Add photos" wide hint="JPG, PNG or WebP · Up to 20 photos, 10 MB each. First photo becomes the cover."><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => setPhotos([...event.target.files])}/></Field>}{!!previews.length && <div className="ws-photo-grid">{previews.map((url, index) => <div key={url}><img src={url} alt={`Selected photo ${index + 1}`}/></div>)}</div>}<Field requirement="Optional" label="Walkaround video" hint="Optional · MP4 or WebM · Up to 100 MB"><input type="file" name="video" accept="video/mp4,video/webm"/></Field>{item?.video && <a className="ws-text-button" href={item.video} target="_blank" rel="noreferrer">View current video ↗</a>}</fieldset>{editable && <div className="ws-editor-footer"><p>Available and reserved listings appear on your public website. Sold cars stay in this workspace.</p>{record && can(user, 'delete', 'car') && <button type="button" className="ws-danger-button" disabled={busy} onClick={deleteCar}>Delete car</button>}<button className="ws-button" disabled={busy}>{busy ? 'Saving…' : record ? 'Save car' : 'Add car'}<Icon name="check" size={17}/></button></div>}</form>;
}

function CustomerEditor({ type, item, user, request, onSaved, busy, setBusy }) {
  const [error, setError] = useState(''); const enquiry = type === 'enquiries';
  const editable = can(user, 'change', enquiry ? 'enquiry' : 'booking');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await request(`${type}/${item.id}`, { method: 'PATCH', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); onSaved(enquiry ? 'Follow-up saved.' : 'Test-drive status updated.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form className="ws-editor-form" onSubmit={submit}><div className="ws-customer-card"><Avatar name={item.name}/><div><h3>{item.name}</h3><span>{enquiry ? 'Customer enquiry' : 'Test-drive customer'}</span></div><Badge value={item.status}/></div><dl className="ws-detail-list"><div><dt>Phone</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div><div><dt>Email</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : 'Not provided'}</dd></div>{enquiry ? <><div><dt>Interested in</dt><dd>{item.interest}</dd></div><div><dt>Preferred date</dt><dd>{item.date ? date(item.date) : 'To be arranged'}</dd></div><div><dt>Received</dt><dd>{date(item.created_at, true)} IST</dd></div></> : <><div><dt>Vehicle</dt><dd>{item.car_name}</dd></div><div><dt>Appointment</dt><dd>{date(item.starts_at, true)} IST</dd></div><div><dt>Reference</dt><dd className="ws-full-reference">{item.reference}</dd></div><div><dt>Email verification</dt><dd>{item.email_verified_at ? `Verified · ${date(item.email_verified_at, true)} IST` : 'Not verified'}</dd></div></>}</dl>{enquiry && <div className="ws-customer-message"><span>CUSTOMER MESSAGE</span><p>{item.message || 'No additional message.'}</p></div>}{error && <div className="ws-error" role="alert">{error}</div>}<fieldset disabled={!editable || busy}><Field label="Status"><select name="status" defaultValue={item.status}>{statuses[type].map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select></Field>{enquiry && <Field label="Internal follow-up notes" hint="Only visible to your showroom team."><textarea name="notes" defaultValue={item.notes} rows={5} maxLength={5000} placeholder="Add call notes, customer preferences or next steps…"/></Field>}</fieldset>{!enquiry && <p className="ws-form-note">Confirm or cancel this request, then contact the customer with the update. Cancelling releases the slot. The owner and administrators receive dashboard alerts; phone alerts are queued when a number is configured.</p>}{editable && <div className="ws-editor-footer"><button className="ws-button" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}<Icon name="check" size={17}/></button></div>}</form>;
}

function SlotEditor({ item, user, request, onSaved, busy, setBusy }) {
  const [cars, setCars] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(!item);
  const editable = can(user, item ? 'change' : 'add', 'testdriveslot');
  useEffect(() => {
    if (item) return;
    const controller = new AbortController();
    (async () => {
      try {
        let next = 1, pages = 1; const all = [];
        do { const body = await request('inventory', { params: { page: next, status: 'available' }, signal: controller.signal }); all.push(...body.results); pages = body.pages; next++; } while (next <= pages);
        if (!controller.signal.aborted) setCars(all);
      } catch (e) { if (!controller.signal.aborted) setError(e.message); } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [item, request]);
  async function submit(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError('');
    const payload = item ? { blocked: form.get('blocked') === 'on' } : { car: Number(form.get('car')), starts_at: `${form.get('date')}T${form.get('time')}:00+05:30`, blocked: form.get('blocked') === 'on' };
    try { await request(`slots${item ? `/${item.id}` : ''}`, { method: item ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); onSaved(item ? 'Appointment availability updated.' : 'Test-drive slot created.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return <form className="ws-editor-form" onSubmit={submit}>{error && <div className="ws-error" role="alert">{error}</div>}{item ? <div className="ws-slot-summary"><Icon name="calendar" size={28}/><h3>{item.car_name}</h3><p>{date(item.starts_at, true)} IST</p><Badge value={item.booked ? 'booked' : 'unbooked'}/></div> : loading ? <div className="ws-loading"><span className="ws-spinner"/>Loading available cars…</div> : !cars.length ? <Empty icon="car" title="No available cars">Add an available car before creating a test-drive slot. You also need permission to view inventory.</Empty> : <fieldset disabled={!editable || busy}><Field label="Vehicle"><select name="car" required><option value="">Choose an available car</option>{cars.map(car => <option key={car.id} value={car.id}>{car.name} · {car.year}</option>)}</select></Field><div className="ws-form-grid"><Field label="Appointment date"><input name="date" type="date" required min={todayIST}/></Field><Field label="Start time (IST)"><select name="time">{Array.from({ length: 8 }, (_, i) => `${i + 10}:00`).map(time => <option key={time}>{time}</option>)}</select></Field></div></fieldset>}<fieldset disabled={!editable || busy}><label className="ws-checkbox"><input name="blocked" type="checkbox" defaultChecked={item?.blocked || false}/> Block this slot from new bookings</label></fieldset><p className="ws-form-note">Each slot is one hour. Blocking a slot does not cancel an existing booking; manage that request in Test drives.</p>{editable && (item || !!cars.length) && <div className="ws-editor-footer"><button className="ws-button" disabled={busy || loading}>{busy ? 'Saving…' : item ? 'Save availability' : 'Create slot'}<Icon name="check" size={17}/></button></div>}</form>;
}

const accessSections = [
  { key: 'inventory', label: 'Vehicles', hint: 'Car details, pricing and photos', actions: ['view', 'add', 'edit'] },
  { key: 'enquiries', label: 'Contact enquiries', hint: 'Customer details and follow-up notes', actions: ['view', 'edit'] },
  { key: 'test-drives', label: 'Test drives', hint: 'Booking details, confirmation and cancellation', actions: ['view', 'edit'] },
  { key: 'slots', label: 'Availability', hint: 'Appointment slots and blocked times', actions: ['view', 'add', 'edit'] },
];
const allAccess = accessSections.flatMap(section => section.actions.map(action => `${section.key}.${action}`));
function StaffPermissions({ access, onChange }) {
  function toggle(section, action, checked) {
    const next = new Set(access), key = `${section}.${action}`;
    if (checked) {
      next.add(key); next.add(`${section}.view`);
      if (key === 'slots.add') next.add('inventory.view');
    } else {
      next.delete(key);
      if (action === 'view') {
        for (const permission of next) if (permission.startsWith(`${section}.`)) next.delete(permission);
        if (section === 'inventory') next.delete('slots.add');
      }
    }
    onChange([...next]);
  }
  return <section className="ws-permissions" aria-labelledby="staff-permissions-title">
    <h3 id="staff-permissions-title">Dashboard permissions</h3>
    <p>Choose what this person can do. Unchecked sections are hidden and blocked.</p>
    <div className="ws-access-presets">
      <button type="button" onClick={() => onChange([])}>No access</button>
      <button type="button" onClick={() => onChange(accessSections.map(section => `${section.key}.view`))}>View only</button>
      <button type="button" onClick={() => onChange(allAccess)}>All daily operations</button>
    </div>
    <div className="ws-access-matrix">
      <div className="ws-access-row ws-access-heading"><span>Section</span><span>View</span><span>Add</span><span>Edit</span></div>
      {accessSections.map(section => <div className="ws-access-row" key={section.key}>
        <span><strong>{section.label}</strong><small>{section.hint}</small></span>
        {['view', 'add', 'edit'].map(action => <span key={action}>{section.actions.includes(action) ? <input type="checkbox" aria-label={`${section.label}: ${action}`} checked={access.includes(`${section.key}.${action}`)} onChange={event => toggle(section.key, action, event.target.checked)}/> : <span aria-label="Not available">&mdash;</span>}</span>)}
      </div>)}
    </div>
    <p className="ws-form-note">Editing vehicles includes uploading photos. Creating slots requires viewing vehicles. Staff cannot manage accounts or permissions. To stop all sign-ins, turn off Active account.</p>
  </section>;
}

function StaffEditor({ item, user, request, onSaved, busy, setBusy }) {
  const [error, setError] = useState(''); const editable = !item?.is_superuser && item?.id !== user.id && (user.is_owner || !item?.is_admin);
  const [access, setAccess] = useState(item?.access || []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget); const data = Object.fromEntries(form);
    data.is_active = form.get('is_active') === 'on'; data.access = access; if (user.is_owner) data.is_admin = form.get('is_admin') === 'on'; if (!data.password) delete data.password;
    try { await request(`staff${item ? `/${item.id}` : ''}`, { method: item ? 'PATCH' : 'POST', body: JSON.stringify(data) }); onSaved(item ? 'Staff account updated.' : 'Staff account created. Share their sign-in details with them securely.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form className="ws-editor-form" onSubmit={submit}>{error && <div className="ws-error" role="alert">{error}</div>}<div className="ws-access-note"><Icon name="lock" size={22}/><div><strong>{item?.is_superuser ? 'Administrator account' : 'Showroom staff access'}</strong><p>{item?.is_superuser ? 'Administrator access is protected. Change your own password in My account.' : 'Choose the sections and actions this person needs below. Administrators can manage staff. Only the owner can grant administrator access.'}</p></div></div><fieldset disabled={!editable || busy}><div className="ws-form-grid"><Field label="First name"><input name="first_name" defaultValue={item?.first_name} maxLength={150}/></Field><Field label="Last name"><input name="last_name" defaultValue={item?.last_name} maxLength={150}/></Field><Field label="Username" wide><input name="username" defaultValue={item?.username} required autoComplete="off" maxLength={150}/></Field><Field label="Email" wide><input name="email" type="email" defaultValue={item?.email} maxLength={254}/></Field><Field label="Alert phone number" wide hint="Optional. Use international format, e.g. +919876543210. Phone alerts go only to owners and administrators."><input name="phone" type="tel" defaultValue={item?.phone} pattern="\+[1-9][0-9]{7,14}" maxLength={16}/></Field>{user.is_owner && <label className="ws-checkbox ws-wide"><input name="is_admin" type="checkbox" defaultChecked={item?.is_admin || false}/> Administrator: full showroom access and staff management</label>}<Field label={item ? 'Reset password (optional)' : 'Initial password'} wide hint={item ? 'Leave empty to keep the current password.' : 'Use a strong password with at least 8 characters.'}><input name="password" type="password" autoComplete="new-password" required={!item} minLength={8}/></Field><label className="ws-checkbox ws-wide"><input type="checkbox" name="is_active" defaultChecked={item ? item.is_active : true}/> Active account — allow this person to sign in</label></div>{editable && <StaffPermissions access={access} onChange={setAccess}/>}</fieldset>{editable && <div className="ws-editor-footer"><button className="ws-button" disabled={busy}>{busy ? 'Saving…' : item ? 'Save staff member' : 'Create staff account'}<Icon name="check" size={17}/></button></div>}</form>;
}

function PhoneSettings({ user, request }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  if (!user.is_admin) return null;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await request('profile', { method: 'PATCH', body: JSON.stringify({ phone: new FormData(event.currentTarget).get('phone') }) });
      setMessage('Alert phone saved. Future alerts will use this number.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit}><Field label="Your alert phone" hint="International format, e.g. +919876543210. Leave blank for dashboard alerts only."><input name="phone" type="tel" defaultValue={user.phone} pattern="\+[1-9][0-9]{7,14}" maxLength={16}/></Field><button className="ws-button" disabled={busy}>{busy ? 'Saving…' : 'Save alert phone'}</button>{message && <p role="status">{message}</p>}</form>;
}

function Alerts({ request }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [page, setPage] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    const load = () => request('notifications', { params: { page }, signal: controller.signal })
      .then(value => { setData(value); setError(''); }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    load(); const timer = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [request, page]);
  async function markRead(id) {
    try {
      const result = await request(`notifications/${id}`, { method: 'PATCH', body: '{}' });
      setData(current => ({ ...current, results: current.results.map(item => item.id === id ? { ...item, read_at: result.read_at } : item), unread: Math.max(0, current.unread - 1) }));
    } catch (error) { setError(error.message); }
  }
  return <section className="ws-panel ws-alerts"><h2>Owner & administrator alerts {data && <span className="ws-count">{data.unread} unread</span>}</h2><p>Updates every 30 seconds. Phone alerts are sent only to active owners and administrators.</p>{data && !data.sms_enabled && <p className="ws-form-note">Phone delivery is not enabled. Configure the SMS service and delivery job before launch. Dashboard alerts are saved.</p>}{error && <div className="ws-error" role="alert">{error}</div>}{!data ? <p>Loading alerts…</p> : !data.results.length ? <Empty title="No alerts yet">Car changes and enquiry or test-drive status updates will appear here.</Empty> : data.results.map(item => <article className="ws-alert-item" key={item.id}><strong>{item.message}</strong><p>{date(item.created_at, true)} IST · Phone: {item.sms_status === 'submitted' ? 'Submitted to provider (delivery not confirmed)' : item.sms_status === 'no_phone' ? 'No phone number configured' : titleCase(item.sms_status)}</p>{item.last_error && <p>{item.last_error}</p>}{!item.read_at && <button className="ws-text-button" onClick={() => markRead(item.id)}>Mark as read</button>}</article>)}<div className="ws-pagination"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {data?.page || page} of {data?.pages || 1}</span><button disabled={!data || page >= data.pages} onClick={() => setPage(p => p + 1)}>Next</button></div></section>;
}

function Account({ user, request, onSaved }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    if (values.new_password !== values.confirm_password) { setError('New passwords do not match.'); return; }
    setBusy(true); setError('');
    try { await request('session', { method: 'POST', body: JSON.stringify({ action: 'password', ...values }) }); form.reset(); onSaved('Your password has been changed.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="ws-account-grid"><section className="ws-panel ws-profile"><Avatar name={user.name}/><h2>{user.name}</h2><p>@{user.username}</p><span className="ws-role"><Icon name="lock" size={13}/>{user.is_admin ? 'Administrator' : 'Staff member'}</span><hr/><PhoneSettings user={user} request={request}/><p>{user.is_admin ? 'You have full access to showroom operations and staff management.' : 'Your administrator manages access to showroom operations.'}</p></section><section className="ws-panel"><div className="ws-panel-title"><div><h2>Change your password</h2><p>Keep your workspace account secure.</p></div><Icon name="lock"/></div><form className="ws-editor-form" onSubmit={submit}>{error && <div className="ws-error" role="alert">{error}</div>}<Field label="Current password"><input name="current_password" type="password" autoComplete="current-password" required/></Field><Field label="New password" hint="At least 8 characters. Avoid common or easily guessed passwords."><input name="new_password" type="password" autoComplete="new-password" minLength={8} required/></Field><Field label="Confirm new password"><input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required/></Field><button className="ws-button" disabled={busy}>{busy ? 'Updating…' : 'Update password'}<Icon name="check" size={17}/></button></form></section></div>;
}
