import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedMaterialModule } from '../shared-material.module';
import { ChatService } from '../chat.service';

export interface ChatMessage {
  originalBotResponse: string;
  id: number;
  userMessage: string;
  botResponse: string;
  rating?: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [SharedMaterialModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  userMessage: string = '';
  sessionId: number | null = null;
  private routeSub: Subscription | null = null;
  private typingInterval: any = null;
  isTypingInProgress: boolean = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Pobierz sessionId z parametrów URL
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
    // Anulowanie subskrypcji i interwałów
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  loadChatHistory() {
    if (!this.sessionId) {
      console.error('Session ID is missing or invalid');
      return;
    }

    this.chatService.getChatHistory(this.sessionId).subscribe({
      next: (data) => (this.messages = data),
      error: (err) => console.error('Failed to load chat history:', err),
    });
  }

  sendMessage() {
    if (!this.sessionId) {
      console.error('Invalid session ID');
      return;
    }

    this.chatService.sendMessage(this.sessionId, this.userMessage).subscribe({
      next: (response) => {
        console.log(response);
        const newMessage: ChatMessage = {
          ...response,
          originalBotResponse: response.botResponse,
          botResponse: '',
        };

        this.messages.push(newMessage);
        this.typeMessage(newMessage);
        this.userMessage = '';
      },
      error: (err) => console.error('Failed to send message:', err),
    });
  }

  updateMessage(message: ChatMessage) {
    if (!this.sessionId) {
      console.error('Invalid session ID');
      return;
    }

    this.chatService.updateMessage(message.id, message.botResponse).subscribe({
      next: () => console.log('Message updated successfully'),
      error: (err) => console.error('Failed to update message:', err),
    });
  }

  rateMessage(id: number, rating: number) {
    this.chatService.rateMessage(id, rating).subscribe({
      next: () => {
        const message = this.messages.find((m) => m.id === id);

        if (message) message.rating = rating;
      },
      error: (err) => console.error('Failed to rate message:', err),
    });
  }

  typeMessage(message: ChatMessage) {
    let currentIndex = 0;
    const typingSpeed = 15;

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    this.isTypingInProgress = true;

    this.typingInterval = setInterval(() => {
      if (currentIndex < message.originalBotResponse.length) {
        message.botResponse += message.originalBotResponse[currentIndex];
        currentIndex++;
      } else {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.isTypingInProgress = false;
      }
    }, typingSpeed);
  }

  interruptTyping() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.isTypingInProgress = false;

    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage) {
      this.updateMessage(lastMessage);
    }
  }
}
