import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component/login.component';
import { RegisterComponent } from './components/register.component/register.component';
import { ForgotPasswordComponent } from './components/forgot.password.component/forgot.password.component';
import { AdminDashboardComponent } from './components/admin.dashboard.component/admin.dashboard.component';
import { HomeComponent } from './components/home.component/home.component';
import { ProductDetailsComponent } from './components/product.details.component/product.details.component';
import { ClientProfilComponent } from './components/client.profil.component/client.profil.component';
import { ClientProductSearchComponent } from './components/client.product.search.component/client.product.search.component';
import { ClientProductDetailsComponent } from './components/client.product.details.component/client.product.details.component';
import { ClientProductPreparationComponent } from './components/client.product.preparation.component/client.product.preparation.component';
import { ClientCardComponent } from './components/client.card.component/client.card.component';
import { ClientProcurementsComponent } from './components/client.procurements.component/client.procurements.component';
import { ClientArchiveComponent } from './components/client.archive.component/client.archive.component';
import { PrinterProfileComponent } from './components/printer.profile.component/printer.profile.component';
import { PrinterAddProductComponent } from './components/printer.add.product.component/printer.add.product.component';
import { PrinterUpdateProductComponent } from './components/printer.update.product.component/printer.update.product.component';
import { PrinterImportJsonComponent } from './components/printer.import.json.component/printer.import.json.component';
import { PrinterOrdersStatusComponent } from './components/printer.orders.status.component/printer.orders.status.component';
import { PrinterBidsComponent } from './components/printer.bids.component/printer.bids.component';
import { ResetPasswordComponent } from './components/reset.password.component/reset.password.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'product-details/:id', component: ProductDetailsComponent },
    { path: 'client-dashboard', component: ClientProfilComponent},
    { path: 'client-product-search', component: ClientProductSearchComponent },
    { path: 'client-product-details/:id', component: ClientProductDetailsComponent },
    { path: 'client-product-prep/:id', component: ClientProductPreparationComponent },
    { path: 'client-cart', component: ClientCardComponent},
    { path: 'client-procurements', component: ClientProcurementsComponent},
    { path: 'client-archive', component:ClientArchiveComponent},
    { path: 'printer-dashboard',component:PrinterProfileComponent},
    { path: 'printer-add-product', component:PrinterAddProductComponent},
    { path: 'printer-products', component:PrinterUpdateProductComponent},
    { path: 'printer-import-json', component:PrinterImportJsonComponent},
    { path: 'printer-orders', component:PrinterOrdersStatusComponent},
    { path: 'printer-bids', component:PrinterBidsComponent},
    { path: 'reset-password/:token', component: ResetPasswordComponent}
];
