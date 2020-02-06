// Angular
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

// App
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// App modules
import { MainComponent } from './modules/main/main.component';
import { AccountsComponent } from './modules/accounts/accounts.component';
import { HeaderComponent } from './components/header/header.component';

// External
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    AccountsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BlockUIModule.forRoot({
      message: 'Loading, please wait...'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
