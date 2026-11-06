import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Services from './pages/Services';
import Skills from './pages/Skills';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import HomepageAdmin from './pages/admin/HomepageAdmin';
import Login from './pages/admin/Login';
import MessagesAdmin from './pages/admin/MessagesAdmin';
import Overview from './pages/admin/Overview';
import ProfileAdmin from './pages/admin/ProfileAdmin';
import ProjectEditor from './pages/admin/ProjectEditor';
import ProjectsAdmin from './pages/admin/ProjectsAdmin';
import SkillsAdmin from './pages/admin/SkillsAdmin';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="projects/new" element={<ProjectEditor />} />
        <Route path="projects/:id/edit" element={<ProjectEditor />} />
        <Route path="homepage" element={<HomepageAdmin />} />
        <Route path="profile" element={<ProfileAdmin />} />
        <Route path="skills" element={<SkillsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
      </Route>
    </Routes>
  );
}
