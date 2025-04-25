// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule],
  providers: [],
  // No bootstrap array as we're using standalone components with bootstrapApplication
})
export class AppModule {}
