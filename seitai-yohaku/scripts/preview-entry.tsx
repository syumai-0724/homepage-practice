import { hydrateRoot } from 'react-dom/client';
import Home from '../components/home';
hydrateRoot(document.getElementById('preview-root')!, <Home/>);
