// =========================
// Config
// =========================
const DEFAULT_QUERY = 'general';
const PAGE_SIZE = 12;
const API_BASE = '/api/news'; // our Vercel serverless proxy

// =========================
// State
// =========================
const state = {
  region: 'in',
  category: 'general',
  query: DEFAULT_QUERY,
  page: 1,
  isLoading: false,
  reachedEnd: false,
};

// Cache: key -> { articles, totalResults }
const responseCache = new Map();

// =========================
// Elements
// =========================
const els = {
  articles: document.getElementById('articles'),
  skeletons: document.getElementById('skeletons'),
  toast: document.getElementById('toast'),
  searchInput: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),
  categories: document.querySelector('.cat-scroller'),
  goHome: document.getElementById('goHome'),
  articleTemplate: document.getElementById('article-card-template'),
  skeletonTemplate: document.getElementById('skeleton-card-template'),
};

// =========================
// Utilities
// =========================
const showToast = (msg, timeoutMs = 2800) => {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (els.toast.hidden = true), timeoutMs);
};

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
  } catch {}
  return '';
}

function getLanguageFromRegion(region) {
  const map = { us: 'en', gb: 'en', au: 'en', ca: 'en', in: 'en' };
  return map[region] || 'en';
}

function computeFromDate(daysBack = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function placeholderImage(title = 'News') {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'>
          <stop offset='0%' stop-color='#0b1220'/>
          <stop offset='100%' stop-color='#11182d'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <g fill='#94a3b8' font-family='Segoe UI, Roboto, Arial' font-size='48'>
        <text x='50%' y='54%' text-anchor='middle'>${title.replace(/&/g, '&amp;')}</text>
      </g>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

// =========================
// API
// =========================
function buildApiUrl({ query, page, pageSize, region }) {
  const params = new URLSearchParams();
  const q = (query && query.trim()) || DEFAULT_QUERY;
  params.set('q', q);
  params.set('from', computeFromDate(30));
  params.set('sortBy', 'publishedAt');
  params.set('language', getLanguageFromRegion(region));
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  
  const url = `${API_BASE}?${params.toString()}`;
  console.log('Built API URL:', url);
  return url;
}

async function fetchArticles(opts) {
  const url = buildApiUrl(opts);
  if (responseCache.has(url)) {
    console.log('Using cached response for:', url);
    return responseCache.get(url);
  }

  console.log('Fetching from API:', url);
  
  try {
    const res = await fetch(url);
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err && err.message) errMsg = err.message;
      } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    
    console.log('API response data:', {
      status: data.status,
      totalResults: data.totalResults,
      articlesCount: data.articles ? data.articles.length : 0
    });
    
    // Check for API errors
    if (data.status && data.status !== 'ok') {
      throw new Error(data.message || 'API error');
    }
    
    // Handle case where articles might be null or undefined
    const articles = data.articles || [];
    const totalResults = data.totalResults || articles.length;

    const normalized = {
      totalResults: totalResults,
      articles: articles.map(a => ({
        title: a.title || 'Untitled',
        description: a.description || '',
        url: a.url,
        image: a.urlToImage || '',
        source: a.source?.name || 'Unknown',
        publishedAt: a.publishedAt,
      })),
    };
    
    console.log('Normalized response:', {
      totalResults: normalized.totalResults,
      articlesCount: normalized.articles.length
    });
    
    responseCache.set(url, normalized);
    return normalized;
  } catch (error) {
    console.error('Fetch articles error:', error);
    throw error;
  }
}

// =========================
// Rendering
// =========================
function clearArticles() {
  els.articles.innerHTML = '';
}

function renderSkeletons(count = 8) {
  els.skeletons.innerHTML = '';
  els.skeletons.hidden = false;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const sk = els.skeletonTemplate.content.cloneNode(true);
    frag.appendChild(sk);
  }
  els.skeletons.appendChild(frag);
}

function hideSkeletons() {
  els.skeletons.hidden = true;
  els.skeletons.innerHTML = '';
}

function createArticleCard(article) {
  const node = els.articleTemplate.content.cloneNode(true);
  const art = node.querySelector('article');
  const mediaLink = node.querySelector('.card-media');
  const img = node.querySelector('img');
  const title = node.querySelector('.card-title');
  const desc = node.querySelector('.card-desc');
  const source = node.querySelector('.card-source');
  const time = node.querySelector('.card-time');

  mediaLink.href = article.url;
  title.href = article.url;
  title.textContent = article.title;
  desc.textContent = article.description || '';
  source.textContent = article.source;
  time.textContent = formatDate(article.publishedAt);
  if (article.publishedAt) time.setAttribute('datetime', article.publishedAt);

  const imgUrl = article.image || placeholderImage('News');
  img.src = imgUrl;
  img.alt = article.title || 'news image';
  img.addEventListener('error', () => {
    img.src = placeholderImage('News');
  });

  revealObserver.observe(art);
  return node;
}

function renderArticles(list, { append = false } = {}) {
  const frag = document.createDocumentFragment();
  for (const a of list) frag.appendChild(createArticleCard(a));
  if (append) {
    els.articles.appendChild(frag);
  } else {
    clearArticles();
    els.articles.appendChild(frag);
  }
}

// =========================
// Observers
// =========================
const revealObserver = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  }
}, { threshold: 0.1 });

// =========================
// Loaders
// =========================
async function loadFirstPage() {
  state.page = 1;
  state.reachedEnd = false;
  state.isLoading = true;
  renderSkeletons(12);
  
  console.log('Loading first page with:', {
    category: state.category,
    query: state.query,
    page: state.page,
    pageSize: PAGE_SIZE
  });
  
  try {
    const { articles, totalResults } = await fetchArticles({
      region: state.region,
      category: state.category,
      query: state.query,
      page: state.page,
      pageSize: PAGE_SIZE,
    });
    hideSkeletons();
    
    console.log('First page response:', {
      articlesCount: articles ? articles.length : 0,
      totalResults: totalResults,
      requestedPageSize: PAGE_SIZE,
      reachedEnd: articles.length < PAGE_SIZE || (totalResults && PAGE_SIZE * state.page >= totalResults),
      hasMoreArticles: totalResults > articles.length
    });
    
    if (!articles || articles.length === 0) {
      clearArticles();
      showToast('No articles found for this search');
      state.reachedEnd = true;
    } else {
      renderArticles(articles, { append: false });
      
      // Check if we've reached the end
      const hasMoreArticles = totalResults > articles.length;
      const isLastPage = PAGE_SIZE * state.page >= totalResults;
      
      console.log('Load more logic:', {
        articlesReturned: articles.length,
        totalResults: totalResults,
        currentPage: state.page,
        hasMoreArticles: hasMoreArticles,
        isLastPage: isLastPage,
        reachedEnd: !hasMoreArticles || isLastPage
      });
      
      state.reachedEnd = !hasMoreArticles || isLastPage;
    }
    updateLoadMore();
  } catch (e) {
    console.error('Load first page error:', e);
    hideSkeletons();
    clearArticles();
    showToast(e.message || 'Failed to load news');
  } finally {
    state.isLoading = false;
    updateLoadMore();
  }
}

async function loadNextPage() {
  if (state.isLoading || state.reachedEnd) return;
  state.isLoading = true;
  updateLoadMore();
  try {
    state.page += 1;
    const { articles, totalResults } = await fetchArticles({
      region: state.region,
      category: state.category,
      query: state.query,
      page: state.page,
      pageSize: PAGE_SIZE,
    });
    
    // Check if we got any articles
    if (!articles || articles.length === 0) {
      state.reachedEnd = true;
      showToast('No more articles available');
    } else {
      renderArticles(articles, { append: true });
      
      // Check if we've reached the end
      const hasMoreArticles = totalResults > (PAGE_SIZE * (state.page - 1) + articles.length);
      const isLastPage = PAGE_SIZE * state.page >= totalResults;
      
      console.log('Load more logic (next page):', {
        articlesReturned: articles.length,
        totalResults: totalResults,
        currentPage: state.page,
        hasMoreArticles: hasMoreArticles,
        isLastPage: isLastPage,
        reachedEnd: !hasMoreArticles || isLastPage
      });
      
      if (!hasMoreArticles || isLastPage) {
        state.reachedEnd = true;
      }
    }
    updateLoadMore();
  } catch (e) {
    console.error('Load more error:', e);
    showToast(e.message || 'Failed to load more articles');
    // Reset page number on error
    state.page -= 1;
  } finally {
    state.isLoading = false;
    updateLoadMore();
  }
}

function updateLoadMore() {
  const btn = document.getElementById('loadMore');
  if (!btn) {
    console.error('Load more button not found');
    return;
  }
  
  console.log('Updating load more button:', {
    reachedEnd: state.reachedEnd,
    isLoading: state.isLoading,
    page: state.page,
    buttonHidden: !!state.reachedEnd,
    buttonDisabled: !!state.isLoading
  });
  
  btn.hidden = !!state.reachedEnd;
  btn.disabled = !!state.isLoading;
  btn.textContent = state.isLoading ? 'Loading…' : 'Load more';
}

// =========================
// Events
// =========================
function onCategoryClick(e) {
  const btn = e.target.closest('button.pill');
  if (!btn) return;
  const cat = btn.getAttribute('data-category');
  if (!cat || state.category === cat) return;
  document.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === btn));
  state.category = cat;
  
  // Use more specific search terms for better results
  const categoryQueries = {
    'general': 'news',
    'business': 'business news',
    'entertainment': 'entertainment news',
    'health': 'health news',
    'science': 'science news',
    'sports': 'sports news',
    'technology': 'technology news'
  };
  
  state.query = categoryQueries[cat] || cat;
  els.searchInput.value = '';
  const searchBox = els.searchInput.closest('.search');
  if (searchBox) searchBox.classList.remove('has-value');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadFirstPage();
}

const onSearchInput = debounce(() => {
  const q = els.searchInput.value.trim();
  state.query = q || DEFAULT_QUERY;
  const searchBox = els.searchInput.closest('.search');
  if (searchBox) searchBox.classList.toggle('has-value', !!q);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadFirstPage();
}, 300);

function onClearSearch() {
  els.searchInput.value = '';
  const searchBox = els.searchInput.closest('.search');
  if (searchBox) searchBox.classList.remove('has-value');
  els.searchInput.focus();
  onSearchInput();
}

function goHome() {
  const first = document.querySelector('.pill[data-category="general"]');
  if (first) {
    document.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b === first));
  }
  state.category = 'general';
  state.query = 'news';
  els.searchInput.value = '';
  const searchBox = els.searchInput.closest('.search');
  if (searchBox) searchBox.classList.remove('has-value');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadFirstPage();
}

// =========================
// Init
// =========================
function init() {
  els.categories.addEventListener('click', onCategoryClick);
  els.searchInput.addEventListener('input', onSearchInput);
  els.clearSearch.addEventListener('click', onClearSearch);
  els.goHome.addEventListener('click', goHome);

  const loadMoreBtn = document.getElementById('loadMore');
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadNextPage);

  // First load
  loadFirstPage();
}

// =========================
// Start
// =========================
document.addEventListener('DOMContentLoaded', init);
