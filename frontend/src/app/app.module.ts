
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Import either the routes for new standalone approach or AppRoutingModule
import { routes } from './app.routes'; // Use this for standalone components
// import { AppRoutingModule } from './app-routing.module'; // Use this for module-based approach

import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { SharedModule } from './shared/shared.module';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { DocumentTypePipe } from './modules/communication/pipes/document-type.pipe';
import { VisibilityLevelPipe } from './modules/communication/pipes/visibility-level.pipe';

@NgModule({
  declarations: [
    // other declarations
    DocumentTypePipe,
    VisibilityLevelPipe
  ],
  // other configurations
})

@NgModule({
  declarations: [
    // AppComponent is now standalone, so it should be removed from here if it's truly standalone
    // AppComponent
    DocumentTypePipe,
    VisibilityLevelPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    
    // Choose ONE of these approaches based on your migration strategy:
    RouterModule.forRoot(routes), // For standalone components
    // AppRoutingModule, // For module-based approach
    
    // If AppComponent is standalone, import it here
    AppComponent,
    // Import other standalone components used at root level
    PageNotFoundComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }