import axios from 'axios';

// Simple in-memory/mock-backend for the frontend so the app works without changing UI.
// It intercepts axios methods that call the real backend URL and returns mocked responses.

const API_ROOT = 'https://lostfound-backend-3198.onrender.com/api';

// Load persisted mock data from localStorage so state survives reloads.
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

let users = load('mock_users', []);
let items = load('mock_items', []);

const persist = () => {
  localStorage.setItem('mock_users', JSON.stringify(users));
  localStorage.setItem('mock_items', JSON.stringify(items));
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// keep original methods for non-mocked URLs
const originalPost = axios.post.bind(axios);
const originalGet = axios.get.bind(axios);
const originalPut = axios.put.bind(axios);
const originalDelete = axios.delete.bind(axios);

const matchApi = (url) => typeof url === 'string' && url.startsWith(API_ROOT);

axios.post = async (url, data, config) => {
  if (!matchApi(url)) return originalPost(url, data, config);

  const path = url.slice(API_ROOT.length);

  // /api/register
  if (path === '/register') {
    const { name, email, password } = data || {};
    if (!name || !email || !password) {
      return Promise.reject({ response: { data: { message: 'All fields are required' } } });
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return Promise.reject({ response: { data: { message: 'User already exists' } } });
    }
    const newUser = { id: genId(), name, email, password };
    users.push(newUser);
    persist();
    return Promise.resolve({ data: { message: 'Registered' }, status: 201 });
  }

  // /api/login
  if (path === '/login') {
    const { email, password } = data || {};
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user || user.password !== password) {
      return Promise.reject({ response: { data: { message: 'Invalid credentials' } } });
    }
    const token = `mock-token-${user.id}`;
    return Promise.resolve({ data: { token, user: { id: user.id, Name: user.name, email: user.email } } });
  }

  // /api/items -> create new item (requires Authorization)
  if (path === '/items') {
    const auth = config?.headers?.Authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/);
    if (!match) return Promise.reject({ response: { data: { message: 'Unauthorized' } } });
    const token = match[1];
    const userId = token.replace('mock-token-', '');
    const user = users.find(u => u.id === userId);
    if (!user) return Promise.reject({ response: { data: { message: 'Invalid token' } } });

    const item = {
      _id: genId(),
      ItemName: data.ItemName || data.itemName || 'Unnamed',
      Description: data.Description || '',
      Type: data.Type || 'Lost',
      Location: data.Location || '',
      Date: data.Date || new Date().toISOString(),
      ContactInfo: data.ContactInfo || '',
      ReportedBy: { _id: user.id, Name: user.name }
    };
    items.unshift(item);
    persist();
    return Promise.resolve({ data: item, status: 201 });
  }

  // fallback
  return originalPost(url, data, config);
};

axios.get = async (url, config) => {
  if (!matchApi(url)) return originalGet(url, config);

  const pathAndQuery = url.slice(API_ROOT.length);
  // /items or /items/search
  if (pathAndQuery.startsWith('/items/search')) {
    // use URL to parse query params
    try {
      const u = new URL(url);
      const name = u.searchParams.get('name') || '';
      const category = u.searchParams.get('category') || '';
      const results = items.filter(it => {
        const matchesName = name ? it.ItemName.toLowerCase().includes(name.toLowerCase()) : true;
        const matchesCat = category ? it.Type === category : true;
        return matchesName && matchesCat;
      });
      return Promise.resolve({ data: results });
    } catch {
      return Promise.resolve({ data: items });
    }
  }

  if (pathAndQuery === '/items') {
    return Promise.resolve({ data: items });
  }

  // allow other gets to pass through
  return originalGet(url, config);
};

axios.put = async (url, data, config) => {
  if (!matchApi(url)) return originalPut(url, data, config);

  const path = url.slice(API_ROOT.length);
  if (path.startsWith('/items/')) {
    const id = path.split('/').pop();
    const auth = config?.headers?.Authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/);
    if (!match) return Promise.reject({ response: { data: { message: 'Unauthorized' } } });
    const token = match[1];
    const userId = token.replace('mock-token-', '');
    const user = users.find(u => u.id === userId);
    if (!user) return Promise.reject({ response: { data: { message: 'Invalid token' } } });

    const idx = items.findIndex(it => it._id === id);
    if (idx === -1) return Promise.reject({ response: { data: { message: 'Item not found' } } });
    if (items[idx].ReportedBy._id !== user.id) return Promise.reject({ response: { data: { message: 'Forbidden' } } });

    items[idx] = { ...items[idx], ...data };
    persist();
    return Promise.resolve({ data: items[idx] });
  }

  return originalPut(url, data, config);
};

axios.delete = async (url, config) => {
  if (!matchApi(url)) return originalDelete(url, config);

  const path = url.slice(API_ROOT.length);
  if (path.startsWith('/items/')) {
    const id = path.split('/').pop();
    const auth = config?.headers?.Authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/);
    if (!match) return Promise.reject({ response: { data: { message: 'Unauthorized' } } });
    const token = match[1];
    const userId = token.replace('mock-token-', '');
    const user = users.find(u => u.id === userId);
    if (!user) return Promise.reject({ response: { data: { message: 'Invalid token' } } });

    const idx = items.findIndex(it => it._id === id);
    if (idx === -1) return Promise.reject({ response: { data: { message: 'Item not found' } } });
    if (items[idx].ReportedBy._id !== user.id) return Promise.reject({ response: { data: { message: 'Forbidden' } } });

    items.splice(idx, 1);
    persist();
    return Promise.resolve({ data: { message: 'Deleted' } });
  }

  return originalDelete(url, config);
};

// expose a small dev helper on window for inspection (non-sensitive)
if (typeof window !== 'undefined') {
  window.__MOCK_BACKEND = {
    users,
    items,
    reset: () => { users = []; items = []; persist(); }
  };
}

export default null;
