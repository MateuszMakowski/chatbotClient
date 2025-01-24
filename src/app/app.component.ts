import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'chatbotClient';

  chatSessions: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadChatSessions();
  }

  loadChatSessions() {
    this.http
      .get('http://localhost:5164/sessions')
      .subscribe((sessions: any) => {
        this.chatSessions = sessions;
      });
  }

  createNewChat() {
    const name = prompt('Enter a name for the new chat:');
    if (name) {
      this.http
        .post('http://localhost:5164/sessions', JSON.stringify(name), {
          headers: { 'Content-Type': 'application/json' },
        })
        .subscribe((newSession: any) => {
          this.chatSessions.push(newSession);
          this.router.navigate(['/chat', newSession.id]);
        });
    }
  }

  goToChat(sessionId: number) {
    this.router.navigate(['/chat', sessionId]);
  }
}
