// frontend/src/app/modules/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
//import { LoginComponent } from './login/login.component';
// import { RegisterComponent } from './register/register.component';
import routes from './auth.routes';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
  declarations: [
    // Ne pas déclarer les composants standalone ici
  ],
  exports: [RouterModule],
})
export class AuthModule {}
