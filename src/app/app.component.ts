import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedMaterialModule } from './shared-material.module';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SharedMaterialModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  chatSessions: any[] = [];

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit() {
    this.loadChatSessions();
  }

  loadChatSessions() {
    this.chatService.getChatSessions().subscribe((sessions) => {
      this.chatSessions = sessions;
    });
  }

  createNewChat() {
    const name = prompt('Enter a name for the new chat:');
    if (name) {
      this.chatService.createChatSession(name).subscribe((newSession) => {
        this.chatSessions.push(newSession);
        this.router.navigate(['/chat', newSession.id]);
      });
    }
  }

  goToChat(sessionId: number) {
    this.router.navigate(['/chat', sessionId]);
  }
}
