import { Routes } from '@angular/router';
import { BlogComponent } from './blog/blog.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { VaultxComponent } from './vaultx/vaultx.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blog', pathMatch: 'full' },
  { path: 'blog', component: BlogComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'vaultx', component: VaultxComponent },
  { path: '**', redirectTo: '/blog' }
];
