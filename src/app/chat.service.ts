import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5164';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getChatSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`, this.httpOptions);
  }

  createChatSession(name: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/sessions`,
      JSON.stringify(name),
      this.httpOptions
    );
  }

  getChatHistory(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, {
      params: { sessionId: sessionId.toString() },
    });
  }

  sendMessage(sessionId: number, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send`, JSON.stringify(message), {
      ...this.httpOptions,
      params: { sessionId: sessionId.toString() },
    });
  }

  updateMessage(messageId: number, response: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/update/${messageId}`,
      JSON.stringify(response),
      this.httpOptions
    );
  }

  rateMessage(id: number, rating: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/rate/${id}`,
      JSON.stringify(rating),
      this.httpOptions
    );
  }
}
