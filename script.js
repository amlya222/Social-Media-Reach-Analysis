const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const metricCards = document.getElementById('metricCards');
const analyticsMetrics = document.getElementById('analyticsMetrics');
const topPostsTableBody = document.querySelector('#topPostsTable tbody');
const allTopPostsTableBody = document.querySelector('#allTopPostsTable tbody');
const engagementTableBody = document.querySelector('#engagementTable tbody');
const hashtagList = document.getElementById('hashtagList');
const viralPostsList = document.getElementById('viralPostsList');
const channelSplitContainer = document.getElementById('channelSplit');
const reachCtx = document.getElementById('reachChart');
const likesCommentsCtx = document.getElementById('likesCommentsChart');
const distributionCtx = document.getElementById('distributionChart');
const heatmapCanvas = document.getElementById('heatmapCanvas');
const platformReachCtx = document.getElementById('platformReachChart');
const typeBreakdownCtx = document.getElementById('typeBreakdownChart');
const engagementTrendCtx = document.getElementById('engagementTrendChart');
const reachGrowthCtx = document.getElementById('reachGrowthChart');
const platformFilter = document.getElementById('platformFilter');
const typeFilter = document.getElementById('typeFilter');
const bestHourEl = document.getElementById('bestHour');
const topHashtagEl = document.getElementById('topHashtag');
const viralCountEl = document.getElementById('viralCount');

let allPosts = [];
let reachChart = null;
let likesCommentsChart = null;
let distributionChart = null;
let heatmapChart = null;
let platformReachChart = null;
let typeBreakdownChart = null;
let engagementTrendChart = null;
let reachGrowthChart = null;

const pageMeta = {
  dashboardPage: {
    title: 'Enterprise Dashboard',
    subtitle: 'Consolidated reach, engagement, and post performance',
  },
  analyticsPage: {
    title: 'Analytics',
    subtitle: 'Detailed channel and content analytics across your dataset',
  },
  engagementPage: {
    title: 'Engagement',
    subtitle: 'Track post engagement and identify top performing content',
  },
  reachInsightsPage: {
    title: 'Reach Insights',
    subtitle: 'Actionable recommendations and reach opportunities',
  },
  topPostsPage: {
    title: 'Top Posts',
    subtitle: 'Review the highest performing posts by reach and engagement',
  },
};

function formatCompact(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

function createMetricCard(title, value, note) {
  return `
    <article class="metric-card">
      <h3>${title}</h3>
      <div class="value">${value}</div>
      <div class="delta">${note}</div>
    </article>
  `;
}

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key];
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
}

function parseDate(value) {
  return new Date(value);
}

function updateChart(instance, ctx, config) {
  if (instance) {
    instance.destroy();
  }
  return new Chart(ctx, config);
}

function drawHeatmap(hours) {
  const labels = ['12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM'];
  const data = labels.map((_, index) => hours[index] || 0);
  heatmapChart = updateChart(heatmapChart, heatmapCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Posts',
        data,
        backgroundColor: data.map(value => `rgba(111, 125, 255, ${0.3 + Math.min(value / 10, 0.55)})`),
        borderRadius: 12,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a5b3d1' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a5b3d1', beginAtZero: true } }
      }
    }
  });
}

function smoothSeries(data, windowSize = 5) {
  if (!data.length || windowSize <= 1) return data;
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const half = Math.floor(windowSize / 2);
    const start = Math.max(0, i - half);
    const end = Math.min(data.length - 1, i + half);
    const windowValues = data.slice(start, end + 1);
    result.push(windowValues.reduce((sum, value) => sum + value, 0) / windowValues.length);
  }
  return result;
}

function drawLineChart(labels, data, ctx, instanceRef) {
  return updateChart(instanceRef, ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        label: 'Value',
        borderColor: '#6f7dff',
        backgroundColor: 'rgba(111,125,255,0.18)',
        fill: true,
        tension: 0.45,
        cubicInterpolationMode: 'monotone',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#f4f7ff'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a5b3d1' } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a5b3d1' } }
      }
    }
  });
}

function drawBarChart(labels, datasets, ctx, instanceRef) {
  return updateChart(instanceRef, ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true, ticks: { color: '#a5b3d1' }, grid: { display: false } },
        y: { stacked: false, ticks: { color: '#a5b3d1' }, grid: { color: 'rgba(255,255,255,0.06)' } }
      },
      plugins: { legend: { labels: { color: '#a5b3d1' } } }
    }
  });
}

function drawDonutChart(labels, values, ctx, instanceRef) {
  return updateChart(instanceRef, ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#6f7dff', '#4fd3ff', '#faa45b', '#8d6fff', '#38d39f'],
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: '#a5b3d1' } } }
    }
  });
}

function renderChannelSplit(platformCounts) {
  const total = Object.values(platformCounts).reduce((sum, value) => sum + value, 0);
  channelSplitContainer.innerHTML = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => {
      const percent = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="channel-bar">
          <span>${platform}</span>
          <span>${percent}%</span>
        </div>
        <div class="channel-progress"><div class="channel-fill" style="width:${percent}%"></div></div>
      `;
    })
    .join('');
}

function renderTopPosts(posts) {
  const sorted = [...posts].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 6);
  topPostsTableBody.innerHTML = sorted
    .map(row => `
      <tr>
        <td>#SM-${String(row.post_id).padStart(4, '0')}</td>
        <td>${row.platform}</td>
        <td>${formatCompact(row.views)}</td>
        <td>${row.likes}</td>
        <td>${(row.engagement_rate * 100).toFixed(1)}%</td>
        <td><span class="tag">${row.content_type}</span></td>
      </tr>
    `)
    .join('');
}

function renderAllTopPosts(posts) {
  const sorted = [...posts].sort((a, b) => b.views - a.views).slice(0, 10);
  allTopPostsTableBody.innerHTML = sorted
    .map(row => `
      <tr>
        <td>#SM-${String(row.post_id).padStart(4, '0')}</td>
        <td>${row.platform}</td>
        <td>${row.content_type}</td>
        <td>${formatCompact(row.views)}</td>
        <td>${row.likes}</td>
        <td>${row.comments}</td>
        <td>${row.shares}</td>
      </tr>
    `)
    .join('');
}

function renderEngagementTable(posts) {
  const sorted = [...posts].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 8);
  engagementTableBody.innerHTML = sorted
    .map(row => `
      <tr>
        <td>#SM-${String(row.post_id).padStart(4, '0')}</td>
        <td>${row.platform}</td>
        <td>${(row.engagement_rate * 100).toFixed(1)}%</td>
        <td>${row.likes}</td>
        <td>${row.comments}</td>
      </tr>
    `)
    .join('');
}

function buildHeatmap(posts) {
  const hourCounts = Array(24).fill(0);
  posts.forEach(post => {
    const hour = parseDate(post.post_datetime).getHours();
    hourCounts[hour] += 1;
  });
  drawHeatmap(hourCounts);
}

function buildCharts(posts) {
  const sortedByDate = [...posts].sort((a, b) => parseDate(a.post_datetime) - parseDate(b.post_datetime));
  const dateMap = {};
  sortedByDate.forEach(post => {
    const date = parseDate(post.post_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap[date] = (dateMap[date] || 0) + post.views;
  });
  const labels = Object.keys(dateMap);
  const reachData = Object.values(dateMap);
  const smoothReachData = smoothSeries(reachData, Math.min(7, reachData.length));
  reachChart = drawLineChart(labels, smoothReachData, reachCtx, reachChart);

  const platforms = [...new Set(posts.map(post => post.platform))];
  const likesData = platforms.map(platform => posts.filter(post => post.platform === platform).reduce((sum, row) => sum + row.likes, 0));
  const commentsData = platforms.map(platform => posts.filter(post => post.platform === platform).reduce((sum, row) => sum + row.comments, 0));
  likesCommentsChart = drawBarChart(platforms, [
    { label: 'Likes', data: likesData, backgroundColor: '#6f7dff' },
    { label: 'Comments', data: commentsData, backgroundColor: '#38d39f' }
  ], likesCommentsCtx, likesCommentsChart);

  const typeCounts = groupBy(posts, 'content_type');
  distributionChart = drawDonutChart(Object.keys(typeCounts), Object.values(typeCounts), distributionCtx, distributionChart);
}

function getTopHashtag(posts) {
  const counts = {};
  posts.forEach(post => {
    if (!post.hashtags) return;
    post.hashtags.split(' ').forEach(tag => {
      const normalized = tag.trim();
      if (!normalized) return;
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function getBestHour(posts) {
  const hourCounts = Array(24).fill(0);
  posts.forEach(post => {
    const hour = parseDate(post.post_datetime).getHours();
    hourCounts[hour] += 1;
  });
  const bestHour = hourCounts.reduce((best, value, index) => (value > hourCounts[best] ? index : best), 0);
  if (bestHour === 0) return '12 AM';
  if (bestHour === 12) return '12 PM';
  return bestHour > 12 ? `${bestHour - 12} PM` : `${bestHour} AM`;
}

function renderInsights(posts) {
  bestHourEl.textContent = getBestHour(posts);
  topHashtagEl.textContent = getTopHashtag(posts);
  viralCountEl.textContent = posts.filter(post => post.is_viral === 1).length;
}

function renderMetrics(posts) {
  const totalReach = posts.reduce((sum, row) => sum + row.views, 0);
  const totalLikes = posts.reduce((sum, row) => sum + row.likes, 0);
  const totalComments = posts.reduce((sum, row) => sum + row.comments, 0);
  const totalShares = posts.reduce((sum, row) => sum + row.shares, 0);
  const avgEngagement = posts.length ? posts.reduce((sum, row) => sum + row.engagement_rate, 0) / posts.length : 0;
  const avgSentiment = posts.length ? posts.reduce((sum, row) => sum + (row.sentiment_score || 0), 0) / posts.length : 0;
  const platformViews = posts.reduce((acc, row) => {
    acc[row.platform] = (acc[row.platform] || 0) + row.views;
    return acc;
  }, {});
  const bestPlatform = Object.entries(platformViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const typeCounts = groupBy(posts, 'content_type');
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  metricCards.innerHTML = `
    ${createMetricCard('Total Reach', formatCompact(totalReach), '')}
    ${createMetricCard('Total Likes', formatCompact(totalLikes), '')}
    ${createMetricCard('Total Comments', formatCompact(totalComments), '')}
    ${createMetricCard('Total Shares', formatCompact(totalShares), '')}
    ${createMetricCard('Avg Engagement', `${(avgEngagement * 100).toFixed(1)}%`, '')}
    ${createMetricCard('Avg Sentiment', `${avgSentiment.toFixed(2)}`, '')}
    ${createMetricCard('Best Platform', bestPlatform, '')}
    ${createMetricCard('Top Post Type', topType, '')}
  `;
}

function updateFilters(posts) {
  const platforms = [...new Set(posts.map(post => post.platform))].sort();
  const types = [...new Set(posts.map(post => post.content_type))].sort();

  platformFilter.innerHTML = '<option value="">All Platforms</option>' + platforms.map(platform => `<option value="${platform}">${platform}</option>`).join('');
  typeFilter.innerHTML = '<option value="">All Types</option>' + types.map(type => `<option value="${type}">${type}</option>`).join('');
}

function getFilteredPosts() {
  return allPosts.filter(post => {
    const platformMatch = !platformFilter.value || post.platform === platformFilter.value;
    const typeMatch = !typeFilter.value || post.content_type === typeFilter.value;
    return platformMatch && typeMatch;
  });
}

function renderDashboard(posts) {
  renderMetrics(posts);
  renderInsights(posts);
  renderChannelSplit(posts.reduce((acc, row) => {
    acc[row.platform] = (acc[row.platform] || 0) + row.views;
    return acc;
  }, {}));
  renderTopPosts(posts);
  buildCharts(posts);
  buildHeatmap(posts);
}

function renderAnalytics(posts) {
  const platformReach = posts.reduce((acc, row) => {
    acc[row.platform] = (acc[row.platform] || 0) + row.views;
    return acc;
  }, {});
  const typeCounts = groupBy(posts, 'content_type');
  analyticsMetrics.innerHTML = `
    ${createMetricCard('Unique Platforms', Object.keys(platformReach).length, '')}
    ${createMetricCard('Content Types', Object.keys(typeCounts).length, '')}
    ${createMetricCard('Average Shares', (posts.reduce((sum, row) => sum + row.shares, 0) / posts.length).toFixed(1), '')}
  `;

  platformReachChart = drawBarChart(
    Object.keys(platformReach),
    [{ label: 'Reach', data: Object.values(platformReach), backgroundColor: '#6f7dff' }],
    platformReachCtx,
    platformReachChart
  );

  typeBreakdownChart = drawDonutChart(
    Object.keys(typeCounts),
    Object.values(typeCounts),
    typeBreakdownCtx,
    typeBreakdownChart
  );
}

function renderEngagement(posts) {
  const dateMap = {};
  [...posts].sort((a, b) => parseDate(a.post_datetime) - parseDate(b.post_datetime)).forEach(post => {
    const date = parseDate(post.post_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap[date] = (dateMap[date] || 0) + post.engagement_rate;
  });
  const dateLabels = Object.keys(dateMap);
  const engagementData = Object.values(dateMap).map(v => v / 1);
  engagementTrendChart = drawLineChart(dateLabels, engagementData, engagementTrendCtx, engagementTrendChart);
  renderEngagementTable(posts);
}

function renderReachInsights(posts) {
  const hashtagCounts = {};
  posts.forEach(post => {
    if (!post.hashtags) return;
    post.hashtags.split(' ').forEach(tag => {
      const normalized = tag.trim();
      if (!normalized) return;
      hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  hashtagList.innerHTML = topHashtags.map(([tag, count]) => `<li>${tag} (${count})</li>`).join('');

  const viralPosts = posts.filter(post => post.is_viral === 1).slice(0, 5);
  viralPostsList.innerHTML = viralPosts.map(post => `<li>#SM-${String(post.post_id).padStart(4, '0')} on ${post.platform}</li>`).join('') || '<li>No viral posts found</li>';

  const reachByPlatform = posts.reduce((acc, row) => {
    acc[row.platform] = (acc[row.platform] || 0) + row.views;
    return acc;
  }, {});
  reachGrowthChart = drawLineChart(Object.keys(reachByPlatform), Object.values(reachByPlatform), reachGrowthCtx, reachGrowthChart);
}

function setActivePage(targetPage) {
  pages.forEach(page => page.classList.toggle('active', page.id === targetPage));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === targetPage));
  const meta = pageMeta[targetPage];
  if (meta) {
    pageTitle.textContent = meta.title;
    pageSubtitle.textContent = meta.subtitle;
  }
}

function initializeNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => setActivePage(btn.dataset.page));
  });
}

function renderAllPages(posts) {
  renderDashboard(posts);
  renderAnalytics(posts);
  renderEngagement(posts);
  renderReachInsights(posts);
  renderAllTopPosts(posts);
}

fetch('/api/data')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    allPosts = data;
    updateFilters(allPosts);
    renderAllPages(allPosts);
    platformFilter.addEventListener('change', () => renderDashboard(getFilteredPosts()));
    typeFilter.addEventListener('change', () => renderDashboard(getFilteredPosts()));
    initializeNavigation();
  })
  .catch(error => {
    console.error('Data load failed', error);
    metricCards.innerHTML = '<div class="metric-card"><h3>Unable to load data</h3><p>Please refresh or check the backend.</p></div>';
  });
