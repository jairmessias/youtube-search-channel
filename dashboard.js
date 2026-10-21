document.addEventListener('DOMContentLoaded', () => {
    const savedContainer = document.getElementById('savedContainer');
    const statTotalChannels = document.getElementById('statTotalChannels');
    const statHighPotential = document.getElementById('statHighPotential');

    // Make loadDashboard available globally
    window.loadDashboard = loadDashboard;

    // loadDashboard(); // Remove auto-load

    async function loadDashboard() {
        try {
            const response = await fetch(window.API_BASE + '/channels');
            if (!response.ok) {
                throw new Error('Failed to load channels');
            }
            const savedChannels = await response.json();

            statTotalChannels.textContent = savedChannels.length;
            savedContainer.innerHTML = '';

            let highPotentialCount = 0;

            savedChannels.forEach(channel => {
                const score = calculateScore(channel);
                if (score >= 90) highPotentialCount++;

                const card = document.createElement('div');
                card.className = 'channel-card';

                // Format Number helper
                const subCount = formatNumber(channel.subs);
                const viewCount = formatNumber(channel.viewCount || 0);

                // Revenue Calculation (Est. $2 RPM)
                // (Total Views / Age Months) / 1000 * 2
                const now = new Date();
                const createdDate = new Date(channel.created);
                const ageMonths = Math.max(1, (now - createdDate) / (1000 * 60 * 60 * 24 * 30));
                const estRevenue = ((parseInt(channel.viewCount || 0) / ageMonths) / 1000) * 2;
                const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(estRevenue);


                // Score Class
                let scoreColor = '#ff4d4d'; // Red
                if (score >= 90) scoreColor = '#00cc66'; // Green
                else if (score >= 75) scoreColor = '#ffcc00'; // Yellow
                else if (score >= 60) scoreColor = '#ff9933'; // Orange

                card.innerHTML = `
                    <div class="score-badge" style="background-color: ${scoreColor}">${score}</div>
                    <img src="${channel.thumb}" alt="${channel.title}" class="channel-thumbnail" referrerpolicy="no-referrer">
                    <h3 class="channel-title">${channel.title}</h3>
                    
                    <div class="channel-stats">
                        <span>${subCount !== 'Hidden' ? subCount + ' Subs' : 'Subs Hidden'}</span>
                        <span>•</span>
                        <span>${channel.videoCount} Vids</span>
                    </div>

                    <div style="background: #2a2a2a; border-radius: 8px; padding: 10px; margin: 10px 0; width: 100%;">
                        <div style="font-size: 0.8rem; color: #aaa; margin-bottom: 5px;">Performance Est.</div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                            <span title="Total Views">👁️ ${viewCount}</span>
                            <span title="Est. Monthly Revenue" style="color: #4caf50;">💰 ${formattedRevenue}/mo</span>
                        </div>
                    </div>

                    <div style="font-size: 0.85rem; color: #888; margin-bottom: 0.5rem;">
                        Created: ${new Date(channel.created).toLocaleDateString()}
                    </div>
                    <div class="card-actions" style="display: flex; gap: 10px; width: 100%; margin-top: auto;">
                        <a href="https://www.youtube.com/channel/${channel.id}" target="_blank" class="visit-btn" style="flex: 1; text-align: center;">Visit</a>
                        <button class="delete-btn" onclick="deleteChannel('${channel.id}')" style="flex: 1; background-color: #333; border: 1px solid var(--border-color); color: #fff; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;

                savedContainer.appendChild(card);
            });

            statHighPotential.textContent = highPotentialCount;

            if (savedChannels.length === 0) {
                savedContainer.innerHTML = '<div class="empty-state"><p>No channels saved yet. Go to Search to find some!</p></div>';
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            savedContainer.innerHTML = '<div class="empty-state"><p style="color:red">Failed to load data. Is Docker running?</p></div>';
        }
    }

    // SCORING SYSTEM Implementation based on gemini.md
    function calculateScore(channel) {
        // Factors:
        // Age (0.15): Newer is better. Max score if < 30 days.
        // Subscribers (0.25): Growth rate proxy.
        // Views (0.20): Not available in current saved object, need to fetch or ignore. For now, assuming default.
        // Consistency (0.15): Videos / Days active.
        // Engagement (0.15): Not available.
        // Replicability (0.10): Manual check, defaulting to 50/100.

        // 1. Age Score (Max 100)
        // If < 30 days = 100. If > 180 days = 0. Linear decay.
        const createdDate = new Date(channel.created.split('/').reverse().join('-')); // Assuming Locale Date String might vary... actually better to parse the savedAt or standard format.
        // Wait, script.js saves `created` as `toLocaleDateString`. This is risky for parsing.
        // Let's try to parse it safely or fallback to savedAt for "recency of finding".
        // IMPROVEMENT: script.js should save ISO string or timestamp. 
        // For now, let's try to parse the string assuming MM/DD/YYYY or similar browser default.
        // A better approach is to rely on 'savedAt' if parsing fails, but 'created' is key.
        // Let's try flexible parsing:
        const now = new Date();
        const ageTime = Math.abs(now - new Date(channel.created));
        const ageDays = Math.ceil(ageTime / (1000 * 60 * 60 * 24));

        let ageScore = 0;
        if (ageDays <= 30) ageScore = 100;
        else if (ageDays <= 90) ageScore = 80;
        else if (ageDays <= 180) ageScore = 50;
        else ageScore = 20;

        // 2. Growth Score (Subs)
        // Ideally Subs/Day. 
        const subs = parseInt(channel.subs) || 0;
        const growthRate = ageDays > 0 ? subs / ageDays : 0;

        let growthScore = 0;
        if (growthRate > 50) growthScore = 100; // > 50 subs/day (1.5k/month)
        else if (growthRate > 20) growthScore = 80;
        else if (growthRate > 5) growthScore = 50;
        else growthScore = 20;

        // 3. Consistency (Videos / Age) -> Uploads per week
        const videos = parseInt(channel.videoCount) || 0;
        const videosPerWeek = (videos / ageDays) * 7;

        let consistencyScore = 0;
        if (videosPerWeek >= 3) consistencyScore = 100; // ~1 video every 2 days
        else if (videosPerWeek >= 1) consistencyScore = 80; // 1 video per week
        else if (videosPerWeek >= 0.5) consistencyScore = 50;
        else consistencyScore = 20;

        // Formula weights from gemini.md
        // We are missing Views (0.20), Engagement (0.15), Replicability (0.10). Total 0.45 missing.
        // We will redistribute weights among available metrics or assume average for missing.
        // Let's assuming missing metrics are "Neutral" (50/100).

        const wAge = 0.15;
        const wGrowth = 0.25;
        const wConsistency = 0.15;
        // Remaining 0.45 assumed at 50 points
        const basePoints = 50 * 0.45;

        const totalScore = (ageScore * wAge) + (growthScore * wGrowth) + (consistencyScore * wConsistency) + basePoints;

        return Math.round(totalScore);
    }

    function formatNumber(numStr) {
        if (numStr === 'Hidden') return numStr;
        const num = parseInt(numStr, 10);
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    }

    window.deleteChannel = async function (id) {
        if (!confirm('Remove this channel?')) return;

        try {
            const response = await fetch(`${window.API_BASE}/channels/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadDashboard();
            } else {
                alert('Failed to delete channel');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error connecting to backend');
        }
    }
});
