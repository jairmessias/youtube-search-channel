# YouTube Channel Finder Automation

## 📋 Visão Geral

Automação desenvolvida para o Antigravity que identifica canais recentes do YouTube com alto potencial para serem modelados. O sistema busca canais com menos de 3 meses de criação, mínimo de 1k inscritos e bom desempenho de views.

## 🎯 Objetivo

Automatizar o processo manual de pesquisa de nichos e canais no YouTube, economizando horas de trabalho e identificando oportunidades de forma sistemática e escalável.

---

## 🔍 Critérios de Busca

### Canais Ideais
- ✅ Criados há **1-3 meses**
- ✅ Mínimo de **1.000 inscritos**
- ✅ Entre **10-30 vídeos** postados
- ✅ Views médias: **50k-500k+** por vídeo recente
- ✅ Taxa de crescimento consistente
- ✅ Formato Dark (sem mostrar rosto) - opcional
- ✅ Conteúdo replicável

### Filtros Aplicados
- ❌ Canais com mais de 6 meses
- ❌ Menos de 1k inscritos
- ❌ Canais inativos (sem upload recente)
- ❌ Canais com edição muito complexa (análise manual)

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   INPUT LAYER                           │
│  • Nichos genéricos (usuário)                          │
│  • Palavras-chave (ChatGPT geradas)                    │
│  • Idiomas alvo                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               YOUTUBE API / WEB SCRAPING                │
│  • YouTube Data API v3                                  │
│  • Busca por palavras-chave + filtro temporal          │
│  • Extração de metadados dos canais                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 PROCESSING LAYER                        │
│  • Filtrar por data de criação                         │
│  • Analisar métricas de crescimento                    │
│  • Calcular médias de views/vídeo                      │
│  • Verificar consistência de upload                    │
│  • Score de qualidade do canal                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              ANALYSIS & SCORING LAYER                   │
│  • RPM estimado (baseado no nicho)                     │
│  • Análise de concorrência por idioma                  │
│  • Dificuldade de replicação                           │
│  • Potencial de monetização                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   OUTPUT LAYER                          │
│  • Planilha ranqueada de canais                        │
│  • Dashboard de oportunidades                          │
│  • Relatório detalhado por canal                       │
│  • Alertas de novos canais (opcional)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica Recomendada

### Backend
- **Python 3.10+**
  - `google-api-python-client` - YouTube Data API
  - `pandas` - Manipulação de dados
  - `selenium` / `playwright` - Web scraping (fallback)
  - `beautifulsoup4` - Parse HTML
  - `requests` - HTTP requests

### Armazenamento
- **PostgreSQL** ou **SQLite** - Banco de dados de canais
- **Redis** - Cache de buscas
- **JSON/CSV** - Exports de relatórios

### Automação (Antigravity)
- **Cron Jobs** / **Celery** - Execução programada
- **Airflow** (opcional) - Orquestração de workflows

### APIs & Serviços
- **YouTube Data API v3** - Dados oficiais
- **OpenAI API** (ChatGPT) - Geração de palavras-chave
- **SerpAPI** (opcional) - Backup para scraping

---

## 📦 Estrutura do Projeto

```
youtube-channel-finder/
│
├── config/
│   ├── settings.py              # Configurações gerais
│   ├── niches.yaml              # Nichos e palavras-chave
│   └── api_keys.env             # Credenciais (não committar)
│
├── src/
│   ├── scrapers/
│   │   ├── youtube_api.py       # Integração YouTube API
│   │   └── web_scraper.py       # Scraping alternativo
│   │
│   ├── processors/
│   │   ├── channel_analyzer.py  # Análise de métricas
│   │   ├── scoring.py           # Sistema de pontuação
│   │   └── filters.py           # Filtros de canais
│   │
│   ├── utils/
│   │   ├── keyword_generator.py # Geração de keywords (ChatGPT)
│   │   ├── date_helpers.py      # Cálculos de datas
│   │   └── logger.py            # Sistema de logs
│   │
│   └── outputs/
│       ├── excel_exporter.py    # Exportar para Excel
│       ├── dashboard.py         # Dashboard HTML
│       └── report_generator.py  # Relatórios PDF
│
├── data/
│   ├── raw/                     # Dados brutos da API
│   ├── processed/               # Dados processados
│   └── exports/                 # Planilhas e relatórios
│
├── notebooks/
│   └── analysis.ipynb           # Análises exploratórias
│
├── tests/
│   └── test_scrapers.py
│
├── .env.example                 # Template de variáveis
├── requirements.txt             # Dependências Python
├── docker-compose.yml           # Setup Docker (opcional)
└── README.md                    # Este arquivo
```

---

## 🚀 Como Começar

### 1. Pré-requisitos

```bash
# Python 3.10+
python --version

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configurar APIs

#### YouTube Data API v3
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a "YouTube Data API v3"
4. Crie credenciais (API Key)
5. Adicione ao arquivo `.env`:

```env
YOUTUBE_API_KEY=sua_chave_aqui
YOUTUBE_API_QUOTA_LIMIT=10000
```

#### OpenAI API (opcional para keywords)
```env
OPENAI_API_KEY=sua_chave_aqui
```

### 3. Configurar Nichos

Edite `config/niches.yaml`:

```yaml
nichos:
  filosofia:
    keywords:
      - nietzsche
      - estoicismo
      - maquiavel
    idiomas:
      - pt
      - en
      - es
    
  historia:
    keywords:
      - segunda guerra mundial
      - napoleao
      - imperio romano
    idiomas:
      - pt
      - en
  
  financas:
    keywords:
      - taxa selic
      - investimentos
      - day trade
    idiomas:
      - pt
```

### 4. Executar Primeira Busca

```bash
# Busca manual
python src/main.py --niche filosofia --language pt

# Busca todos os nichos configurados
python src/main.py --all

# Modo debug
python src/main.py --niche historia --debug
```

---

## 📊 Métricas Coletadas

### Por Canal
- **Nome do canal**
- **URL do canal**
- **Data de criação**
- **Número de inscritos**
- **Total de vídeos**
- **Total de views**
- **Views médias por vídeo**
- **Taxa de crescimento** (inscritos/dia)
- **Frequência de upload**
- **Último upload** (data)
- **Idioma principal**
- **Nicho/Subnicho**

### Por Vídeo (Top 5 vídeos)
- **Título**
- **Views**
- **Data de publicação**
- **Likes/Comentários**
- **Duração**
- **Thumbnail URL**

### Análises Calculadas
- **Score de Qualidade** (0-100)
- **RPM Estimado** (baseado no nicho)
- **Ganhos Estimados** (último mês)
- **Dificuldade de Replicação** (Fácil/Médio/Difícil)
- **Concorrência no Idioma** (Baixa/Média/Alta)

---

## 🎯 Sistema de Pontuação (Score)

```python
Score Total = (
    idade_canal * 0.15 +           # Quanto mais novo, melhor
    crescimento_subscribers * 0.25 + # Taxa de crescimento
    views_por_video * 0.20 +        # Média de views
    consistencia_upload * 0.15 +    # Regularidade
    engagement_rate * 0.15 +        # Likes/comentários
    replicabilidade * 0.10          # Facilidade de copiar
)
```

### Classificação
- **90-100**: 🟢 Excelente - Modelar imediatamente
- **75-89**: 🟡 Bom - Vale a pena considerar
- **60-74**: 🟠 Médio - Analisar manualmente
- **<60**: 🔴 Baixo - Não recomendado

---

## 📈 Outputs Gerados

### 1. Planilha Excel (`canais_encontrados.xlsx`)

| Canal | Inscritos | Vídeos | Views Médias | Score | RPM Est. | Ganho Est. | Idioma | Nicho | URL |
|-------|-----------|--------|--------------|-------|----------|------------|--------|-------|-----|
| Canal A | 5.2k | 13 | 150k | 92 | R$ 8 | R$ 5k | PT | História | link |
| Canal B | 3.8k | 18 | 80k | 85 | R$ 6 | R$ 3k | EN | Filosofia | link |

### 2. Dashboard HTML Interativo
- Gráficos de distribuição por nicho
- Timeline de crescimento
- Mapa de calor de oportunidades
- Filtros interativos

### 3. Relatório PDF
- Top 20 canais ranqueados
- Análise detalhada de cada canal
- Recomendações de ação
- Comparativo com concorrentes

---

## ⚙️ Configurações Avançadas

### Limites da API
```python
# config/settings.py

YOUTUBE_API_CONFIG = {
    'daily_quota': 10000,  # Limite diário do YouTube
    'requests_per_minute': 100,
    'max_results_per_search': 50,
    'cache_expiration': 3600  # 1 hora
}
```

### Filtros Customizados
```python
CHANNEL_FILTERS = {
    'min_subscribers': 1000,
    'max_subscribers': 100000,
    'min_videos': 5,
    'max_videos': 50,
    'max_age_days': 90,  # 3 meses
    'min_avg_views': 10000,
    'min_upload_frequency': 2,  # vídeos por semana
}
```

### Alertas Automáticos
```python
ALERT_CONFIG = {
    'enable_email': True,
    'email_on_high_score': 90,
    'telegram_bot_token': 'seu_token',
    'check_interval_hours': 6
}
```

---

## 🔄 Fluxo de Automação

### Execução Diária (Recomendado)
```bash
# Adicionar ao crontab (Linux/Mac)
0 9 * * * /path/to/venv/bin/python /path/to/src/main.py --all --export

# Ou usar Celery Beat
celery -A tasks beat --loglevel=info
```

### Workflow Sugerido
1. **09:00** - Busca automática de novos canais
2. **10:00** - Análise e pontuação
3. **11:00** - Envio de relatório por email
4. **Manual** - Validação dos Top 10
5. **Manual** - Decisão de modelagem

---

## 📚 Casos de Uso

### Caso 1: Encontrar Canal para Traduzir
```bash
python src/main.py \
  --niche historia \
  --source-language en \
  --target-language pt \
  --check-competition
```
**Output**: Canais em inglês sem versão em português

### Caso 2: Nichos em Alta Agora
```bash
python src/main.py \
  --trending \
  --max-age 30 \
  --min-growth-rate 100
```
**Output**: Canais criados há menos de 30 dias com crescimento >100 subs/dia

### Caso 3: Análise de Concorrente
```bash
python src/main.py \
  --analyze-channel "https://youtube.com/@canal" \
  --find-similar
```
**Output**: Análise detalhada + canais similares

---

## 🐛 Troubleshooting

### Erro: Quota Exceeded
```
Solução: A API do YouTube tem limite de 10.000 unidades/dia
- Reduza frequência de buscas
- Use cache agressivamente
- Considere múltiplas API keys
```

### Erro: No channels found
```
Solução:
- Verifique as palavras-chave (muito específicas?)
- Aumente o range de datas (max_age_days)
- Reduza filtros mínimos (min_subscribers, min_views)
```

### Erro: Rate limit
```
Solução:
- Adicione delays entre requisições (time.sleep)
- Use rotating proxies
- Implemente exponential backoff
```

---

## 🔐 Segurança e Compliance

### Boas Práticas
- ✅ Nunca committar API keys (use `.env`)
- ✅ Respeitar limites de rate da API
- ✅ Não fazer scraping agressivo
- ✅ Armazenar dados de forma segura
- ✅ Seguir ToS do YouTube

### LGPD / GDPR
- Dados coletados são públicos
- Não armazenar informações pessoais
- Permitir opt-out se solicitado

---

## 🚦 Roadmap

### Fase 1 - MVP (Semana 1-2)
- [x] Setup do projeto
- [ ] Integração YouTube API
- [ ] Filtros básicos
- [ ] Export para Excel

### Fase 2 - Análise (Semana 3-4)
- [ ] Sistema de pontuação
- [ ] Análise de concorrência
- [ ] Estimativa de RPM
- [ ] Dashboard HTML

### Fase 3 - Automação (Semana 5-6)
- [ ] Execução via cron
- [ ] Alertas por email/Telegram
- [ ] Geração de palavras-chave com IA
- [ ] Análise de thumbnails (CV)

### Fase 4 - Avançado (Futuro)
- [ ] Machine Learning para predição
- [ ] Análise de sentimento de comentários
- [ ] Integração com ferramentas de edição
- [ ] API própria para outros usuários

---

## 📖 Recursos Adicionais

### Documentação
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Antigravity Docs](https://antigravity.com/docs)
- [Google API Python Client](https://github.com/googleapis/google-api-python-client)

### Ferramentas Complementares
- **TubeBuddy** - Análise de keywords
- **VidIQ** - Métricas de vídeos
- **Social Blade** - Estatísticas de crescimento

### Comunidade
- Discord: [Link do servidor]
- Telegram: [Link do grupo]
- Email: suporte@seuprojeto.com

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## ✨ Autores

- **Seu Nome** - Desenvolvimento inicial - [@seu_usuario](https://github.com/seu_usuario)

---

## 🙏 Agradecimentos

- Comunidade YouTube Automation Brasil
- Curso que inspirou este projeto
- Contribuidores do projeto

---

**Última atualização**: Janeiro 2026

**Status**: 🚧 Em Desenvolvimento

**Versão**: 0.1.0