import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import { FullPageLoader } from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Skills = lazy(() => import('./pages/Skills'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const HomepageAdmin = lazy(() => import('./pages/admin/HomepageAdmin'));
const Login = lazy(() => import('./pages/admin/Login'));
const MessagesAdmin = lazy(() => import('./pages/admin/MessagesAdmin'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const ProfileAdmin = lazy(() => import('./pages/admin/ProfileAdmin'));
const ProjectEditor = lazy(() => import('./pages/admin/ProjectEditor'));
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'));
const SkillsAdmin = lazy(() => import('./pages/admin/SkillsAdmin'));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader label="Loading page" />}>
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
    </Suspense>
  );
}
