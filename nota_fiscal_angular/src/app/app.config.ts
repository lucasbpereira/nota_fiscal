import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';

import { routes } from './app.routes';
import localePt from '@angular/common/locales/pt';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura'; // Corrigido o nome do pacote
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    })
  ]
};
