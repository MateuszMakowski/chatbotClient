import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: 'chat/:sessionId', component: ChatComponent },
  { path: '**', redirectTo: '' },
];
