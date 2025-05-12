import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private platform: PlatformService) {}

  getItem(key: string): string | null {
    return this.platform.localStorage?.getItem(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.platform.localStorage?.setItem(key, value);
  }

  removeItem(key: string): void {
    this.platform.localStorage?.removeItem(key);
  }

  clear(): void {
    this.platform.localStorage?.clear();
  }
} 