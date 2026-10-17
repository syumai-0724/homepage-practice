import { hydrateRoot } from 'react-dom/client';
import SiteHome from '../components/site-home';
import Booking from '../components/booking';
import DesignEditor from '../components/design-editor';
declare global { interface Window { __YOHAKU_PAGE__?: string } }
hydrateRoot(document.getElementById('preview-root')!, window.__YOHAKU_PAGE__ === 'reservation' ? <Booking homePath="preview.html"/> : window.__YOHAKU_PAGE__ === 'design-editor' ? <DesignEditor homePath="preview.html"/> : <SiteHome bookingPath="reservation.html" editorPath="design-editor.html"/>);
