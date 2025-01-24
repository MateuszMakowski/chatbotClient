import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  userMessage: string = '';
  sessionId: number | null = null;
  private routeSub: Subscription | null = null;

  private currentInterval: any = null;
  isTypingInProgress: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const sessionId = params.get('sessionId');
      this.sessionId = sessionId ? parseInt(sessionId, 10) : null;

      if (this.sessionId) {
        this.loadChatHistory();
      } else {
        console.warn('No session ID provided.');
      }
    });
  }

  ngOnDestroy() {
    // Upewnij się, że subskrypcja jest anulowana
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadChatHistory() {
    if (!this.sessionId) {
      console.error('Session ID is missing or invalid');
      return;
    }

    this.http
      .get('http://localhost:5164/history', {
        params: { sessionId: this.sessionId.toString() },
      })
      .subscribe(
        (data: any) => {
          this.messages = data;
        },
        (error) => {
          console.error('Failed to load chat history:', error);
        }
      );
  }

  sendMessage() {
    if (!this.sessionId || this.sessionId <= 0) {
      console.error('Invalid session ID: ', this.sessionId);
      return;
    }

    this.http
      .post(`http://localhost:5164/send`, JSON.stringify(this.userMessage), {
        params: { sessionId: this.sessionId?.toString() },
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe((response: any) => {
        console.log(response);
        const newMessage = {
          ...response.message,
          originalBotResponse: response.message.botResponse,
          botResponse: '',
        };

        this.messages = [...this.messages, newMessage];

        this.typeMessage(newMessage);

        this.userMessage = '';
      });
  }

  updateMessage(message: any) {
    if (!this.sessionId || this.sessionId <= 0) {
      console.error('Invalid session ID: ', this.sessionId);
      return;
    }

    this.http
      .put(
        `http://localhost:5164/update/${message.id}`,
        JSON.stringify(message.botResponse),
        {
          params: { sessionId: this.sessionId?.toString() },
          headers: { 'Content-Type': 'application/json' },
        }
      )
      .subscribe({
        next: () => console.log('Wiadomość zaktualizowana pomyślnie'),
        error: (err) =>
          console.error('Błąd podczas aktualizacji wiadomości:', err),
      });
  }

  rateMessage(id: number, rating: number) {
    this.http.put(`http://localhost:5164/rate/${id}`, rating).subscribe({
      next: () => {
        const message = this.messages.find((m) => m.id === id);
        if (message) message.rating = rating;
      },
    });
  }

  typeMessage(message: any) {
    let currentIndex = message.botResponse.length;
    const typingSpeed = 15;

    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }

    this.isTypingInProgress = true;

    this.currentInterval = setInterval(() => {
      if (currentIndex < message.originalBotResponse.length) {
        message.botResponse += message.originalBotResponse[currentIndex];
        currentIndex++;
      } else {
        clearInterval(this.currentInterval);
        this.currentInterval = null;
        this.isTypingInProgress = false;
      }
    }, typingSpeed);
  }

  interruptTyping() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }

    this.isTypingInProgress = false;

    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage) {
      this.updateMessage(lastMessage);
    }
  }
}
