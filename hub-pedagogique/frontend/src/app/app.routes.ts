import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DetailComponent } from './pages/detail/detail.component';
import { MySpaceComponent } from './pages/my-space/my-space.component';

export const routes: Routes = [
  { path: '', component: CatalogComponent, title: 'Catalogue' },
  { path: 'resource/:id', component: DetailComponent, title: 'Détail' },
  { path: 'mon-espace', component: MySpaceComponent, title: 'Mon espace' },
  { path: '**', redirectTo: '' }
];
