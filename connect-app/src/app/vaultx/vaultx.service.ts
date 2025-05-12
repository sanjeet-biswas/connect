import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { VaultItemType } from './vaultx.types';

@Injectable({
  providedIn: 'root'
})
export class VaultxService {
  private readonly ENCRYPTION_KEY = 'your-secure-key'; // In production, use environment variables
  private readonly API_URL = 'http://localhost:3000/api'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Encryption methods
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return '';
    }
  }

  // File handling methods
  uploadFile(file: File): Observable<{ url: string; type: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(`${this.API_URL}/upload`, formData).pipe(
      map(response => ({
        url: response.url,
        type: file.type.split('/')[1],
        size: Math.round(file.size / 1024)
      })),
      catchError(this.handleError)
    );
  }

  // Item methods
  getItems(): Observable<VaultItemType[]> {
    return this.http.get<VaultItemType[]>(`${this.API_URL}/items`).pipe(
      map(items => items.map(item => ({
        ...item,
        description: this.decrypt(item.description),
        ...(item.type === 'credential' && item.metadata && {
          metadata: {
            ...item.metadata,
            username: item.metadata.username ? this.decrypt(item.metadata.username) : undefined,
            password: item.metadata.password ? this.decrypt(item.metadata.password) : undefined
          }
        })
      }))),
      catchError(this.handleError)
    );
  }

  addItem(item: VaultItemType): Observable<VaultItemType> {
    console.log('Adding new item:', item);
    
    // Remove ID for new items to let server generate it
    const { id, ...itemWithoutId } = item;
    
    const encryptedItem = {
      ...itemWithoutId,
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

    console.log('Sending encrypted item:', encryptedItem);

    return this.http.post<VaultItemType>(`${this.API_URL}/items`, encryptedItem).pipe(
      map(response => {
        console.log('Received response:', response);
        return {
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
        };
      }),
      catchError(error => {
        console.error('Error adding item:', error);
        return this.handleError(error);
      })
    );
  }

  updateItem(item: VaultItemType): Observable<VaultItemType> {
    if (!item.id) {
      return throwError(() => new Error('Item ID is required for update'));
    }

    const encryptedItem = {
      ...item,
      description: this.encrypt(item.description),
      ...(item.type === 'credential' && item.metadata && {
        metadata: {
          ...item.metadata,
          username: item.metadata.username ? this.encrypt(item.metadata.username) : '',
          password: item.metadata.password ? this.encrypt(item.metadata.password) : ''
        }
      }),
      ...(item.type === 'link' && item.metadata && {
        metadata: {
          ...item.metadata,
          url: item.metadata.url || ''
        }
      })
    };

    return this.http.put<VaultItemType>(`${this.API_URL}/items/${item.id}`, encryptedItem).pipe(
      map(response => ({
        ...response,
        description: this.decrypt(response.description),
        ...(response.type === 'credential' && response.metadata && {
          metadata: {
            ...response.metadata,
            username: response.metadata.username ? this.decrypt(response.metadata.username) : '',
            password: response.metadata.password ? this.decrypt(response.metadata.password) : ''
          }
        })
      })),
      catchError(this.handleError)
    );
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateOrder(itemIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/items/order`, { itemIds }).pipe(
      catchError(this.handleError)
    );
  }

  // Search methods
  searchItems(query: string): Observable<VaultItemType[]> {
    return this.http.get<VaultItemType[]>(`${this.API_URL}/items/search`, {
      params: { query: query.toLowerCase() }
    }).pipe(
      map(items => items.map(item => ({
        ...item,
        description: this.decrypt(item.description),
        metadata: {
          ...(item.type === 'credential' && {
            username: item.metadata?.username ? this.decrypt(item.metadata.username) : '',
            password: item.metadata?.password ? this.decrypt(item.metadata.password) : ''
          }),
          ...(item.type === 'link' && {
            url: item.metadata?.url ? this.decrypt(item.metadata.url) : ''
          })
        }
      }))),
      catchError(this.handleError)
    );
  }
} 