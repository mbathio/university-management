import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { AuthService } from './core/auth/auth.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    const authServiceMock = {
      currentUser: of(null),
      currentUserValue: null,
      autoLogin: jasmine.createSpy('autoLogin'),
      hasRole: jasmine.createSpy('hasRole').and.returnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [HeaderComponent, SidenavComponent] },
        add: { imports: [] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Université Cheikh Hamidou Kane' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Université Cheikh Hamidou Kane');
  });
});
