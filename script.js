document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');

    // Tab Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab') + '-view';
            document.getElementById(targetId).classList.add('active');

            // Load data if switching to dashboard
            if (tab.getAttribute('data-tab') === 'dashboard') {
                // We assume loadDashboard is available globally or we dispatch an event
                // check if loadDashboard function exists (it's in dashboard.js)
                if (typeof window.loadDashboard === 'function') {
                    window.loadDashboard();
                }
            }
        });
    });

    // Placeholder for API Key - In a real app we might ask the user for this or use a backend proxy
    // For this personal project, the user can edit this file or we can prompt them.
    let YOUTUBE_API_KEY = '';

    // Check for API Key in local storage
    const storedKey = localStorage.getItem('yt_api_key');
    if (storedKey) {
        YOUTUBE_API_KEY = storedKey;
    } else {
        // Simple prompt for the first run
        setTimeout(() => {
            const key = prompt("Please enter your YouTube Data API v3 Key to use the search functionality:");
            if (key) {
                YOUTUBE_API_KEY = key;
                localStorage.setItem('yt_api_key', key);
            }
        }, 1000);
    }

    // Search Event Listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const query = searchInput.value.trim();

        if (!query) {
            alert('Please enter a channel name to search.');
            return;
        }

        if (!YOUTUBE_API_KEY) {
            const key = prompt("API Key missing. Please provide your YouTube Data API Key:");
            if (key) {
                YOUTUBE_API_KEY = key;
                localStorage.setItem('yt_api_key', key);
            } else {
                alert('An API Key is required to search.');
                return;
            }
        }

        showLoading();

        try {
            await searchChannels(query);
        } catch (error) {
            console.error('Search error:', error);
            showError(`An error occurred: ${error.message}`);
        }
    }

    async function searchChannels(query) {
        // API Endpoint for Search
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=50&key=${YOUTUBE_API_KEY}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!response.ok) {
            // Check for Quota Error
            if (response.status === 403 && data.error && data.error.message.includes('quota')) {
                const newKey = prompt("⚠️ YouTube API Quota Exceeded for this key!\n\nPlease enter a DIFFERENT API Key to continue:");
                if (newKey) {
                    YOUTUBE_API_KEY = newKey;
                    localStorage.setItem('yt_api_key', newKey);
                    // Retry search with new key
                    return searchChannels(query);
                }
            }
            throw new Error(data.error.message || 'Failed to fetch results');
        }

        // We need another call to get channel statistics (sub count) because 'search' endpoint provided snippet doesn't include it.
        // We will collect all channel IDs.
        const channels = data.items;

        if (channels.length === 0) {
            showNoResults();
            return;
        }

        const channelIds = channels.map(item => item.id.channelId).join(',');
        const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`;

        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        // Strategy Filters Configuration
        const FILTER_CONFIG = {
            maxAgeDays: 180, // Approx 6 months
            minSubscribers: 1000,
            minVideos: 10
        };

        const now = new Date();

        // Map stats back to channel items and Filter
        const channelsWithStats = channels.map(channel => {
            const stats = statsData.items.find(item => item.id === channel.id.channelId);
            return {
                ...channel,
                statistics: stats ? stats.statistics : { subscriberCount: 'Hidden', videoCount: '0' }
            };
        }).filter(channel => {
            const stats = channel.statistics;
            const snippet = channel.snippet;

            // 1. Filter by Age
            const createdDate = new Date(snippet.publishedAt);
            const diffTime = Math.abs(now - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > FILTER_CONFIG.maxAgeDays) return false;

            // 2. Filter by Subscriber Count
            // If hidden, we can't verify, so deciding whether to keep or drop. 
            // Strategy implies we need metrics, so we probably drop hidden ones or valid ones.
            // Let's drop hidden ones to be safe/strict.
            if (stats.subscriberCount === 'Hidden') return false;
            const subs = parseInt(stats.subscriberCount, 10);
            if (isNaN(subs) || subs < FILTER_CONFIG.minSubscribers) return false;

            // 3. Filter by Video Count
            const videos = parseInt(stats.videoCount, 10);
            if (isNaN(videos) || videos < FILTER_CONFIG.minVideos) return false;

            return true;
        });

        if (channelsWithStats.length === 0) {
            resultsContainer.innerHTML = '<div class="empty-state"><p>No channels found matching the strict strategy criteria (Min 1k Subs, < 6 Months Old).</p></div>';
            return;
        }

        renderResults(channelsWithStats);
    }

    function renderResults(channels) {
        resultsContainer.innerHTML = ''; // Clear previous results

        channels.forEach(channel => {
            const snippet = channel.snippet;
            const stats = channel.statistics;

            const card = document.createElement('div');
            card.className = 'channel-card';

            const subCount = formatNumber(stats.subscriberCount);

            // Format Creation Date
            const createdDate = new Date(snippet.publishedAt).toLocaleDateString();

            card.innerHTML = `
                <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="channel-thumbnail" referrerpolicy="no-referrer">
                <h3 class="channel-title">${snippet.title}</h3>
                <div class="channel-stats">
                    <span>${subCount !== 'Hidden' ? subCount + ' Subs' : 'Subs Hidden'}</span>

                    <span>•</span>
                    <span>${stats.videoCount} Videos</span>
                </div>
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 0.5rem;">
                    Created: ${createdDate}
                </div>
                <p class="channel-description">${snippet.description || 'No description available.'}</p>
                <div class="card-actions" style="display: flex; gap: 10px; width: 100%;">
                    <a href="https://www.youtube.com/channel/${channel.id.channelId}" target="_blank" class="visit-btn" style="flex: 1; text-align: center;">Visit</a>
                    <button class="save-btn" onclick="saveChannel('${channel.id.channelId}', '${escapeHtml(snippet.title)}', '${snippet.thumbnails.medium.url}', '${stats.subscriberCount}', '${stats.videoCount}', '${snippet.publishedAt}', '${stats.viewCount}', '${escapeHtml(snippet.description)}')" style="flex: 1; background-color: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 5px; cursor: pointer; font-weight: 600;">Save</button>
                </div>
            `;


            resultsContainer.appendChild(card);
        });
    }

    // Helper to prevent XSS issues in inline onclick
    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // Expose saveChannel to global scope so inline onclick works
    window.saveChannel = async function (id, title, thumb, subs, videoCount, created, viewCount, description) {
        const channelData = {
            id,
            title,
            thumb,
            subs,
            videoCount,
            created,
            viewCount: viewCount || '0',
            description: description || ''
        };

        try {
            const response = await fetch(window.API_BASE + '/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(channelData)
            });

            if (response.ok) {
                alert(`Saved ${title} to dashboard!`);
            } else {
                const error = await response.json();
                if (response.status === 400 && error.detail === 'Channel already saved') {
                    alert('Channel already saved!');
                } else {
                    alert('Error saving channel: ' + error.detail);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to backend. Make sure Docker is running!');
        }
    }

    function showLoading() {
        resultsContainer.innerHTML = '<div class="empty-state"><p>Searching...</p></div>';
    }

    function showError(message) {
        resultsContainer.innerHTML = `<div class="empty-state"><p style="color: var(--accent-color);">${message}</p></div>`;
    }

    function showNoResults() {
        resultsContainer.innerHTML = '<div class="empty-state"><p>No channels found matching your query.</p></div>';
    }

    function formatNumber(numStr) {
        if (numStr === 'Hidden') return numStr;
        const num = parseInt(numStr, 10);
        if (isNaN(num)) return '0';

        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    }
});
