# StoryLens — NLP Intelligence Platform

An interactive full-stack NLP platform for exploring 602 synthetic stories across 6 writing styles, 5 themes, and 4 countries. Built with FastAPI + React.

![StoryLens](https://img.shields.io/badge/NLP-Intelligence%20Platform-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

## Features

| Module | Description |
|--------|-------------|
| **Story Browser** | Search and filter 602 stories by style, theme, and country |
| **Zipf's Law** | Log-rank vs log-frequency plots per writing style with slope comparison |
| **Dependency Parsing** | Max dependency arc span (max_dep) as a syntactic complexity metric via spaCy |
| **Style Fingerprinting** | 10 stylometric features (TTR, passive voice, POS ratios, punctuation density) on a radar chart |
| **Text Classification** | Country prediction (China vs Northern Ireland) with Word2Vec + Logistic Regression, BERT, and ModernBERT |
| **Sentiment & Emotion** | RoBERTa sentiment scoring + dual emotion model comparison per theme |
| **Question Answering** | Extractive QA with `deepset/bert-base-uncased-squad2` + fine-tuning configuration |

---

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- spaCy (`en_core_web_sm`) — dependency parsing, POS tagging
- Gensim — Word2Vec (Google News 300-dim)
- HuggingFace Transformers — BERT, RoBERTa, ModernBERT
- scikit-learn — Logistic Regression classifier
- numpy, scipy, pandas

**Frontend**
- React 18 + Vite
- Tailwind CSS — glass morphism dark UI
- Recharts — scatter, bar, radar charts
- React Router DOM
- Axios with Vite proxy (no hardcoded URLs)

---

## Project Structure

```
storylens/
├── backend/
│   ├── main.py              # FastAPI app + CORS
│   ├── stories.json         # Dataset (602 stories)
│   ├── requirements.txt
│   ├── models/
│   │   ├── zipf_model.py    # Zipf's law computation
│   │   ├── dep_model.py     # Dependency parsing
│   │   ├── style_model.py   # Stylometric features
│   │   ├── classifier.py    # Word2Vec + BERT configs
│   │   ├── sentiment_model.py
│   │   └── qa_model.py      # Extractive QA
│   ├── routers/             # 7 API routers
│   └── utils/
│       └── data_loader.py   # Relative-path JSON loader
└── frontend/
    ├── src/
    │   ├── pages/           # 8 pages
    │   ├── components/
    │   └── api/client.js    # Axios instance
    └── vite.config.js       # Proxy → localhost:8000
```

---

## Getting Started

### Prerequisites
- Python 3.11
- Node.js 18+
- Visual C++ Redistributable 2022 (Windows)

### Backend

```bash
cd storylens/backend
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu  # CPU-only PyTorch
python -m spacy download en_core_web_sm

# Place stories.json in backend/
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd storylens/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Dataset

602 synthetic stories with metadata fields: `index`, `theme`, `style`, `country`, `person`, `setting`, `object_concept1`, `object_concept2`, `story`, `question1`, `answer1`, `question2`, `answer2`.

**Styles:** legalistic · descriptive · hard-boiled · stream of consciousness · journalistic · for children  
**Themes:** political rebellion · scientific discovery · a dangerous voyage · love · a mysterious conspiracy  
**Countries:** China · Northern Ireland · India · Brazil

---

## Models Used

| Task | Model |
|------|-------|
| Sentiment | `cardiffnlp/twitter-roberta-base-sentiment-latest` |
| Emotion (1) | `cardiffnlp/twitter-roberta-base-emotion-multilabel-latest` |
| Emotion (2) | `j-hartmann/emotion-english-distilroberta-base` |
| Extractive QA | `deepset/bert-base-uncased-squad2` |
| Classification | Word2Vec (Google News 300d) + Logistic Regression |
| Fine-tune config | `bert-base-uncased`, `answerdotai/ModernBERT-base` |

---

## License

MIT
