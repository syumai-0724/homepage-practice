import { hydrateRoot } from 'react-dom/client';
import Home from '../components/home';
import Booking from '../components/booking';
declare global { interface Window { __YOHAKU_PAGE__?: string } }
hydrateRoot(document.getElementById('preview-root')!, window.__YOHAKU_PAGE__ === 'reservation' ? <Booking homePath="preview.html"/> : <Home bookingPath="reservation.html"/>);
