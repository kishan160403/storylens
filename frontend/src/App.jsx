import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import ZipfAnalysis from './pages/ZipfAnalysis'
import DependencyAnalysis from './pages/DependencyAnalysis'
import StyleAnalysis from './pages/StyleAnalysis'
import Classification from './pages/Classification'
import SentimentAnalysis from './pages/SentimentAnalysis'
import QuestionAnswering from './pages/QuestionAnswering'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:index" element={<StoryDetail />} />
          <Route path="/zipf" element={<ZipfAnalysis />} />
          <Route path="/dependency" element={<DependencyAnalysis />} />
          <Route path="/style" element={<StyleAnalysis />} />
          <Route path="/classify" element={<Classification />} />
          <Route path="/sentiment" element={<SentimentAnalysis />} />
          <Route path="/qa" element={<QuestionAnswering />} />
        </Routes>
      </main>
    </div>
  )
}
