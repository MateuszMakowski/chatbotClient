import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class ChatComponent implements OnInit {
  messages: any[] = [];
  userMessage: string = '';
  private currentInterval: any = null;
  isTypingInProgress: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadChatHistory();
  }

  loadChatHistory() {
    this.http.get('http://localhost:5164/history').subscribe((data: any) => {
      this.messages = data;
    });
  }

  sendMessage() {
    this.http
      .post('http://localhost:5164/send', JSON.stringify(this.userMessage), {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe((response: any) => {
        const newMessage = {
          ...response,
          originalBotResponse: response.botResponse,
          botResponse: '',
        };

        this.messages = [...this.messages, newMessage];

        this.typeMessage(newMessage);

        this.userMessage = '';
      });
  }

  updateMessage(message: any) {
    this.http
      .put(
        `http://localhost:5164/update/${message.id}`,
        JSON.stringify(message.botResponse),
        {
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
