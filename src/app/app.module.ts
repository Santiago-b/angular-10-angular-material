import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent, CustomDPHeader } from './app.component';
import { HelloComponent } from './hello.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatGridListModule,
  ],
  declarations: [AppComponent, HelloComponent, CustomDPHeader],
  bootstrap: [AppComponent],
})
export class AppModule {}
