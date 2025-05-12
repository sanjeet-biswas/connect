import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VaultItemType } from './vault-item.type';
import { handleError } from '../utils/error-handler';

@Injectable({
  providedIn: 'root'
})
export class VaultxService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  addItem(item: VaultItemType): Observable<VaultItemType> {
    const encryptedItem = {
      ...item,
      description: this.encrypt(item.description),
      metadata: {
        ...(item.type === 'credential' && {
          username: item.metadata?.username ? this.encrypt(item.metadata.username) : '',
          password: item.metadata?.password ? this.encrypt(item.metadata.password) : ''
        }),
        ...(item.type === 'link' && {
          url: item.metadata?.url ? this.encrypt(item.metadata.url) : ''
        })
      }
    };

    return this.http.post<VaultItemType>(`${this.apiUrl}/items`, encryptedItem).pipe(
      map(response => ({
        ...response,
        description: this.decrypt(response.description),
        metadata: {
          ...(response.type === 'credential' && {
            username: response.metadata?.username ? this.decrypt(response.metadata.username) : '',
            password: response.metadata?.password ? this.decrypt(response.metadata.password) : ''
          }),
          ...(response.type === 'link' && {
            url: response.metadata?.url ? this.decrypt(response.metadata.url) : ''
          })
        }
      })),
      catchError(this.handleError)
    );
  }

  private encrypt(value: string): string {
    // Implementation of encrypt method
    return value;
  }

  private decrypt(value: string): string {
    // Implementation of decrypt method
    return value;
  }

  private handleError(error: any): Observable<never> {
    return handleError(error);
  }
} 