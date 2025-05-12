import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get window(): Window | null {
    return this.isBrowser ? window : null;
  }

  get document(): Document | null {
    return this.isBrowser ? document : null;
  }

  get localStorage(): Storage | null {
    return this.isBrowser ? window.localStorage : null;
  }

  get matchMedia(): MediaQueryList | null {
    return this.isBrowser ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  }

  get scrollY(): number {
    return this.isBrowser ? window.scrollY : 0;
  }
} 