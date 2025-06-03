// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http'; 
// import { routes } from './app.routes';
// import { CsrfInterceptor} from './service/csrf.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true }

//   ]
// };
// app.config.ts

import { ApplicationConfig, provideZoneChangeDetection,importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { CsrfInterceptor } from './service/csrf.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(NgbModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()  // ✅ Uses interceptors provided via DI
    ),
    CsrfInterceptor  // ✅ Provide it as a service
  ],
}
