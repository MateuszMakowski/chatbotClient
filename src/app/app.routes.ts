import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: 'chat/:sessionId', component: ChatComponent }, // Konkretny czat
  { path: '**', redirectTo: '' }, // Obsługa nieznanych tras
];
