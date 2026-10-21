// Channel Discovery Engine
// Finds channels matching predefined criteria using category seed keywords
// and/or trending videos, then filters, scores, sorts and groups them.

// Seeds per category, per language. pt = Portuguese content, en = English content.
const CATEGORY_SEEDS = {
    'Finanças Pessoais': {
        pt: ['finanças pessoais', 'como economizar dinheiro', 'orçamento familiar', 'vida financeira'],
        en: ['personal finance', 'how to save money', 'budgeting tips', 'money habits']
    },
    'Investimentos': {
        pt: ['investimentos para iniciantes', 'renda fixa', 'bolsa de valores explicado', 'carteira de investimentos'],
        en: ['investing for beginners', 'stock market explained', 'index funds', 'investment portfolio']
    },
    'Negócios e Empreendedorismo': {
        pt: ['empreendedorismo', 'como abrir um negócio', 'modelo de negócio', 'negócios lucrativos'],
        en: ['entrepreneurship', 'how to start a business', 'business model', 'profitable business ideas']
    },
    'Carreira e Profissões': {
        pt: ['carreira profissional', 'dicas de currículo', 'entrevista de emprego', 'soft skills'],
        en: ['career advice', 'resume tips', 'job interview', 'soft skills workplace']
    },
    'Inteligência Artificial': {
        pt: ['inteligência artificial explicada', 'IA no dia a dia', 'machine learning explicado', 'notícias de IA'],
        en: ['artificial intelligence explained', 'AI tools', 'machine learning explained', 'AI news']
    },
    'Softwares e Ferramentas': {
        pt: ['melhores ferramentas', 'tutorial de software', 'apps que fazem diferença', 'automação de tarefas'],
        en: ['best software tools', 'software tutorial', 'must have apps', 'task automation']
    },
    'Cibersegurança': {
        pt: ['cibersegurança explicada', 'como se proteger online', 'golpes digitais', 'privacidade digital'],
        en: ['cybersecurity explained', 'online safety tips', 'scams explained', 'digital privacy']
    },
    'Ciência e Tecnologia': {
        pt: ['ciência explicada', 'tecnologia do futuro', 'curiosidades científicas', 'invenções incríveis'],
        en: ['science explained', 'future technology', 'science facts', 'amazing inventions']
    },
    'História e Documentários': {
        pt: ['história explicada', 'documentário curto', 'curiosidades históricas', 'impérios antigos'],
        en: ['history explained', 'short documentary', 'history facts', 'ancient empires']
    },
    'Crimes e Mistérios': {
        pt: ['casos reais resolvidos', 'crimes misteriosos', 'mistérios não resolvidos', 'true crime'],
        en: ['true crime cases', 'unsolved mysteries', 'cold cases', 'disappearances explained']
    },
    'Psicologia e Comportamento': {
        pt: ['psicologia explicada', 'manipulação e persuasão', 'inteligência emocional', 'comportamento humano'],
        en: ['psychology explained', 'persuasion techniques', 'emotional intelligence', 'human behavior']
    },
    'Produtividade e Hábitos': {
        pt: ['produtividade', 'como criar hábitos', 'gestão do tempo', 'foco e disciplina'],
        en: ['productivity tips', 'how to build habits', 'time management', 'focus and discipline']
    },
    'Saúde e Longevidade': {
        pt: ['saúde e bem-estar', 'longevidade', 'dicas de saúde', 'sono e descanso'],
        en: ['health and wellness', 'longevity', 'health tips', 'sleep science']
    },
    'Casa e Organização': {
        pt: ['organização da casa', 'clean home', 'declutter', 'arrumação da casa'],
        en: ['home organization', 'clean home', 'declutter your life', 'home decluttering']
    },
    'Carros e Mobilidade': {
        pt: ['curiosidades sobre carros', 'indústria automotiva', 'carros elétricos', 'história dos carros'],
        en: ['car facts', 'automotive industry', 'electric vehicles', 'history of cars']
    },
    'Viagens e Vida no Exterior': {
        pt: ['viver no exterior', 'custo de vida', 'melhores cidades para morar', 'imigração'],
        en: ['living abroad', 'cost of living', 'best cities to live', 'moving to another country']
    },
    'Pets e Animais': {
        pt: ['curiosidades sobre animais', 'cuidados com pets', 'comportamento animal', 'raças de cães'],
        en: ['animal facts', 'pet care tips', 'animal behavior', 'dog breeds explained']
    },
    'Sustentabilidade e Futuro': {
        pt: ['sustentabilidade', 'energia limpa', 'clima e ambiente', 'futuro do planeta'],
        en: ['sustainability', 'clean energy', 'climate change explained', 'future of the planet']
    },
    'Livros e Filosofia': {
        pt: ['resumo de livros', 'filosofia explicada', 'grandes pensadores', 'estoicismo'],
        en: ['book summary', 'philosophy explained', 'great thinkers', 'stoicism']
    },
    'Religião e Mitologia': {
        pt: ['mitologia explicada', 'religiões do mundo', 'mitos e lendas', 'histórias bíblicas'],
        en: ['mythology explained', 'world religions', 'myths and legends', 'bible stories']
    },
    'Cultura Pop e Nostalgia': {
        pt: ['cultura pop', 'nostalgia anos 90', 'história do cinema', 'curiosidades de filmes'],
        en: ['pop culture', '90s nostalgia', 'history of cinema', 'movie facts']
    },
    'Games e Indústria Gamer': {
        pt: ['indústria dos games', 'história dos videogames', 'curiosidades de games', 'game dev'],
        en: ['gaming industry', 'history of video games', 'gaming facts', 'game development']
    },
    'Beleza e Cuidados Pessoais': {
        pt: ['skincare', 'cuidados com a pele', 'rotina de beleza', 'auto-cuidado'],
        en: ['skincare routine', 'skincare explained', 'self care routine', 'beauty tips']
    },
    'Moda e Luxo': {
        pt: ['história da moda', 'marcas de luxo', 'tendências de moda', 'estilo pessoal'],
        en: ['history of fashion', 'luxury brands', 'fashion trends', 'personal style']
    },
    'Educação e Conhecimentos Gerais': {
        pt: ['conhecimentos gerais', 'você sabia', 'curiosidades do mundo', 'aprenda algo novo'],
        en: ['general knowledge', 'did you know facts', 'world facts', 'learn something new']
    },
    // --- Original general categories (kept) ---
    'Gaming': {
        pt: ['gameplay highlights', 'análise de jogos indie', 'dicas de jogos'],
        en: ['gameplay highlights', 'indie game review', 'gaming tips tricks']
    },
    'Fitness e Treino': {
        pt: ['treino em casa', 'motivação fitness', 'hipertrofia'],
        en: ['home workout routine', 'fitness motivation', 'strength training']
    },
    'Culinária': {
        pt: ['receitas fáceis', 'tutorial de cozinha', 'comida de rua'],
        en: ['easy recipes', 'cooking tutorial', 'street food tour']
    },
    'Vlogs e Estilo de Vida': {
        pt: ['vlog diário', 'vida minimalista', 'rotina de produtividade'],
        en: ['daily vlog life', 'minimalist lifestyle', 'productivity routine']
    },
    'Beleza': {
        pt: ['tutorial de maquiagem', 'rotina de skincare', 'haul de moda'],
        en: ['makeup tutorial', 'skincare routine', 'fashion haul']
    },
    'Viagens': {
        pt: ['vlog de viagem', 'destinos escondidos', 'viagem econômica'],
        en: ['travel vlog', 'hidden travel destinations', 'budget travel tips']
    },
    'Música': {
        pt: ['novos artistas', 'covers de músicas', 'produção musical'],
        en: ['new music artist', 'cover songs', 'music production tips']
    }
};

// Language code used for YouTube API relevanceLanguage param
let DISCOVER_LANG = 'pt';

// Filters used by the discovery pipeline
const DISCOVER_FILTERS = {
    maxAgeDays: 180,   // ~6 months (set from form)
    minSubs: 1000,
    maxSubs: 50000,
    minUploadsPerWeek: 1,
    minAvgViews: 1000
};

document.addEventListener('DOMContentLoaded', () => {
    const chipsContainer = document.getElementById('categoryChips');
    const discoverBtn = document.getElementById('discoverButton');
    const discoverContainer = document.getElementById('discoverContainer');
    const useTrending = document.getElementById('useTrending');
    const trendingRegion = document.getElementById('trendingRegion');

    if (!chipsContainer || !discoverBtn) return;

    let selectedCategories = new Set();

    const counterLabel = document.getElementById('categoryCounter');

    function updateCounter() {
        if (!counterLabel) return;
        const n = selectedCategories.size;
        counterLabel.textContent = n === 0 ? 'nenhuma selecionada' : `${n} selecionada${n > 1 ? 's' : ''}`;
        counterLabel.style.color = n > 0 ? 'var(--accent-color)' : 'var(--text-secondary)';
    }

    function setChip(name, on) {
        if (on) selectedCategories.add(name); else selectedCategories.delete(name);
        const chip = [...chipsContainer.children].find(c => c.textContent === name);
        if (chip) chip.classList.toggle('active', on);
        updateCounter();
    }

    // Build category chips
    Object.keys(CATEGORY_SEEDS).forEach(name => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'category-chip';
        chip.textContent = name;
        chip.addEventListener('click', () => setChip(name, !selectedCategories.has(name)));
        chipsContainer.appendChild(chip);
    });

    // Select all / clear
    const selectAllBtn = document.getElementById('selectAllCategories');
    const clearBtn = document.getElementById('clearCategories');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => {
        Object.keys(CATEGORY_SEEDS).forEach(name => setChip(name, true));
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
        Object.keys(CATEGORY_SEEDS).forEach(name => setChip(name, false));
    });
    updateCounter();

    discoverBtn.addEventListener('click', runDiscovery);

    // Language selector
    const langSelect = document.getElementById('discoverLang');
    if (langSelect) {
        DISCOVER_LANG = langSelect.value || 'pt';
        langSelect.addEventListener('change', () => {
            DISCOVER_LANG = langSelect.value;
        });
    }

    async function runDiscovery() {
        const apiKey = localStorage.getItem('yt_api_key');
        if (!apiKey) {
            alert('Configure primeiro sua chave da API do YouTube (aba Buscar).');
            return;
        }

        if (selectedCategories.size === 0 && !useTrending.checked) {
            alert('Selecione ao menos uma categoria ou habilite o escaneamento de vídeos em alta.');
            return;
        }

        // Read filters from form
        const months = parseInt(document.getElementById('fMaxAge').value, 10) || 6;
        DISCOVER_FILTERS.maxAgeDays = months * 30;
        DISCOVER_FILTERS.minSubs = parseInt(document.getElementById('fMinSubs').value, 10) || 0;
        DISCOVER_FILTERS.maxSubs = parseInt(document.getElementById('fMaxSubs').value, 10) || Infinity;
        DISCOVER_FILTERS.minUploadsPerWeek = parseFloat(document.getElementById('fMinUploads').value) || 0;
        DISCOVER_FILTERS.minAvgViews = parseInt(document.getElementById('fMinViews').value, 10) || 0;

        discoverBtn.disabled = true;
        discoverBtn.textContent = 'Discovering...';
        discoverContainer.innerHTML = '<div class="empty-state"><p>Escaneando o YouTube em busca de canais que atendem aos seus critérios...</p></div>';

        const found = new Map(); // channelId -> { channel, category, score }

        try {
            // 1. Category seed searches (seeds in the selected language).
            // Seeds are shuffled per run so results vary between executions.
            const shuffled = arr => [...arr].sort(() => Math.random() - 0.5);
            for (const category of selectedCategories) {
                const cat = CATEGORY_SEEDS[category];
                const seeds = shuffled(cat[DISCOVER_LANG]).slice(0, 2); // limit quota usage
                for (const seed of seeds) {
                    const items = await ytSearchChannels(apiKey, seed);
                    for (const item of items) {
                        if (!found.has(item.id.channelId)) {
                            found.set(item.id.channelId, { channel: item, category });
                        }
                    }
                }
            }

            // 2. Trending scan
            if (useTrending.checked) {
                const region = trendingRegion.value || 'US';
                const items = await ytTrendingChannels(apiKey, region);
                for (const item of items) {
                    if (!found.has(item.channelId)) {
                        found.set(item.channelId, { channel: {
                            id: { channelId: item.channelId },
                            snippet: item.snippet
                        }, category: 'Em Alta' });
                    }
                }
            }

            // 3. Fetch stats for all candidate channels
            const ids = [...found.keys()];
            if (ids.length === 0) {
                showEmpty('Nenhum canal candidato encontrado. Tente outras categorias ou habilite o escaneamento de vídeos em alta.');
                return;
            }

            const statsList = await ytChannelStats(apiKey, ids);
            const statsById = new Map(statsList.map(s => [s.id, s.statistics]));

            // 4. Apply filters + score
            const results = [];
            for (const [id, entry] of found) {
                const stats = statsById.get(id);
                if (!stats) continue;

                const enriched = enrichChannel(entry.channel, stats);
                if (!passesFilters(enriched)) continue;

                enriched.score = scoreChannel(enriched);
                enriched.category = entry.category;
                results.push(enriched);
            }

            // 5. Sort by score desc
            results.sort((a, b) => b.score - a.score);

            if (results.length === 0) {
                showEmpty('Nenhum canal passou nos seus filtros. Tente relaxar os critérios (idade, faixa de inscritos, views).');
                return;
            }

            renderGrouped(results);

        } catch (err) {
            console.error('Discovery error:', err);
            showEmpty('Erro durante a descoberta: ' + err.message);
        } finally {
            discoverBtn.disabled = false;
            discoverBtn.textContent = 'Descobrir Canais';
        }
    }

    // --- YouTube API helpers ---

    async function ytFetch(url) {
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
            const msg = data.error ? data.error.message : 'API request failed';
            throw new Error(`[${res.status}] ${msg}`);
        }
        return data;
    }

    async function ytSearchChannels(apiKey, query) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&relevanceLanguage=${DISCOVER_LANG}&maxResults=25&key=${apiKey}`;
        const data = await ytFetch(url);
        return data.items || [];
    }

    async function ytTrendingChannels(apiKey, regionCode) {
        // Videos endpoint: trending videos, we then extract channels
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=50&key=${apiKey}`;
        const data = await ytFetch(url);
        const seen = new Set();
        const channels = [];
        for (const v of (data.items || [])) {
            const cid = v.snippet.channelId;
            if (seen.has(cid)) continue;
            seen.add(cid);
            channels.push({ channelId: cid, snippet: {
                title: v.snippet.channelTitle,
                description: v.snippet.description || '',
                publishedAt: v.snippet.publishedAt, // video date, channel date fetched via stats
                thumbnails: v.snippet.thumbnails
            }});
        }
        return channels;
    }

    async function ytChannelStats(apiKey, ids) {
        const items = [];
        const chunk = 50;
        for (let i = 0; i < ids.length; i += chunk) {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${ids.slice(i, i + chunk).join(',')}&key=${apiKey}`;
            const data = await ytFetch(url);
            items.push(...(data.items || []));
        }
        return items;
    }

    // --- Enrichment / Filtering / Scoring ---

    function enrichChannel(channel, stats) {
        const snippet = channel.snippet || {};
        const subs = stats.hiddenSubscriberCount ? null : parseInt(stats.subscriberCount || '0', 10);
        const videoCount = parseInt(stats.videoCount || '0', 10);
        const viewCount = parseInt(stats.viewCount || '0', 10);
        // channel snippet (from channels endpoint) has real publishedAt
        const created = snippet.publishedAt || null;
        const now = new Date();
        const ageDays = created ? Math.max(1, Math.ceil((now - new Date(created)) / 86400000)) : null;
        const uploadsPerWeek = ageDays ? (videoCount / ageDays) * 7 : 0;
        const avgViews = videoCount > 0 ? viewCount / videoCount : 0;

        return {
            id: (channel.id && channel.id.channelId) || channel.id || stats.id || null,
            title: snippet.title || 'Unknown',
            description: snippet.description || '',
            thumb: snippet.thumbnails && (snippet.thumbnails.medium || snippet.thumbnails.default) ? (snippet.thumbnails.medium || snippet.thumbnails.default).url : '',
            subs, videoCount, viewCount, created, ageDays,
            uploadsPerWeek, avgViews
        };
    }

    function passesFilters(c) {
        if (c.ageDays === null) return false;                 // must have creation date
        if (c.ageDays > DISCOVER_FILTERS.maxAgeDays) return false;   // too old
        if (c.subs === null) return false;                    // hidden subs
        if (c.subs < DISCOVER_FILTERS.minSubs) return false;
        if (c.subs > DISCOVER_FILTERS.maxSubs) return false;
        if (c.uploadsPerWeek < DISCOVER_FILTERS.minUploadsPerWeek) return false;
        if (c.avgViews < DISCOVER_FILTERS.minAvgViews) return false;
        return true;
    }

    function scoreChannel(c) {
        // Age: newer = better (max 100 if <=30d)
        let ageScore = 20;
        if (c.ageDays <= 30) ageScore = 100;
        else if (c.ageDays <= 90) ageScore = 80;
        else if (c.ageDays <= 180) ageScore = 50;

        // Growth: subs per day
        const subsPerDay = c.ageDays ? c.subs / c.ageDays : 0;
        let growthScore = 20;
        if (subsPerDay > 50) growthScore = 100;
        else if (subsPerDay > 20) growthScore = 80;
        else if (subsPerDay > 5) growthScore = 50;

        // Consistency: uploads per week
        let consistencyScore = 20;
        if (c.uploadsPerWeek >= 3) consistencyScore = 100;
        else if (c.uploadsPerWeek >= 1) consistencyScore = 80;
        else if (c.uploadsPerWeek >= 0.5) consistencyScore = 50;

        // Views per video (log scale)
        let viewsScore = 20;
        if (c.avgViews >= 50000) viewsScore = 100;
        else if (c.avgViews >= 10000) viewsScore = 80;
        else if (c.avgViews >= 2000) viewsScore = 50;

        const total = (ageScore * 0.20) + (growthScore * 0.30) + (consistencyScore * 0.25) + (viewsScore * 0.25);
        return Math.round(total);
    }

    // --- Rendering ---

    function scoreColor(score) {
        if (score >= 90) return '#00cc66';
        if (score >= 75) return '#ffcc00';
        if (score >= 60) return '#ff9933';
        return '#ff4d4d';
    }

    function renderGrouped(results) {
        discoverContainer.innerHTML = '';
        const groups = new Map();
        results.forEach(r => {
            if (!groups.has(r.category)) groups.set(r.category, []);
            groups.get(r.category).push(r);
        });

        for (const [category, channels] of groups) {
            const group = document.createElement('div');
            group.className = 'category-group';
            group.innerHTML = `
                <div class="category-group-header">
                    <span class="category-group-title">${category}</span>
                    <span class="category-group-count">${channels.length} canais</span>
                </div>
                <div class="results-grid"></div>
            `;
            const grid = group.querySelector('.results-grid');
            channels.forEach(c => grid.appendChild(buildCard(c)));
            discoverContainer.appendChild(group);
        }
    }

    function buildCard(c) {
        const card = document.createElement('div');
        card.className = 'channel-card';
        const fmt = n => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);
        card.innerHTML = `
            <div class="score-badge" style="background-color: ${scoreColor(c.score)}">${c.score}</div>
            <img src="${c.thumb}" alt="${c.title}" class="channel-thumbnail" referrerpolicy="no-referrer">
            <h3 class="channel-title">${c.title}</h3>
            <div class="channel-stats">
                <span>${fmt(c.subs)} inscritos</span>
                <span>•</span>
                <span>${fmt(c.videoCount)} vídeos</span>
            </div>
            <div style="font-size: 0.85rem; color: #888;">
                Criado em: ${new Date(c.created).toLocaleDateString()} (${c.uploadsPerWeek.toFixed(1)} uploads/sem · ${fmt(Math.round(c.avgViews))} views/vídeo)
            </div>
            <p class="channel-description">${c.description || 'Sem descrição disponível.'}</p>
            <div class="card-actions" style="display: flex; gap: 10px; width: 100%; margin-top: auto;">
                <a href="https://www.youtube.com/channel/${c.id}" target="_blank" class="visit-btn" style="flex: 1; text-align: center;">Visit</a>
                <button class="save-btn" style="flex: 1; background-color: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 5px; cursor: pointer; font-weight: 600;">Salvar</button>
            </div>
        `;
        const saveBtn = card.querySelector('.save-btn');
        saveBtn.addEventListener('click', async () => {
            try {
                const res = await fetch(window.API_BASE + '/channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: c.id, title: c.title, description: c.description,
                        thumb: c.thumb, subs: String(c.subs), videoCount: String(c.videoCount),
                        viewCount: String(c.viewCount), created: c.created
                    })
                });
                if (res.ok) {
                    saveBtn.textContent = 'Salvo ✓';
                    saveBtn.disabled = true;
                } else {
                    alert('Falha ao salvar o canal.');
                }
            } catch (e) {
                alert('Falha ao conectar ao backend. Verifique se o Docker está rodando.');
            }
        });
        return card;
    }

    function showEmpty(msg) {
        discoverContainer.innerHTML = `<div class="empty-state"><p>${msg}</p></div>`;
    }
});