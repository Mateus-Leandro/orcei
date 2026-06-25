import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly PRIMARY_COLOR_KEY = 'primary_color';

  // Deve refletir o valor de $primary em src/app/global/themes/color.scss
  private readonly DEFAULT_PRIMARY_COLOR = '#18926e';

  getPrimaryColor(): string {
    return localStorage.getItem(this.PRIMARY_COLOR_KEY) ?? this.DEFAULT_PRIMARY_COLOR;
  }

  setPrimaryColor(color: string): void {
    localStorage.setItem(this.PRIMARY_COLOR_KEY, color);
    this.applyPrimaryColor(color);
  }

  loadPrimaryColor(): void {
    this.applyPrimaryColor(this.getPrimaryColor());
  }

  resetPrimaryColor(): void {
    localStorage.removeItem(this.PRIMARY_COLOR_KEY);
    this.applyPrimaryColor(this.DEFAULT_PRIMARY_COLOR);
  }

  /**
   * Aplica a cor apenas visualmente, sem persistir no cache.
   * Útil para preview enquanto o usuário escolhe a cor.
   */
  previewPrimaryColor(color: string): void {
    this.applyPrimaryColor(color);
  }

  private applyPrimaryColor(color: string): void {
    // Sobrescreve a variável CSS --primary definida em color.scss.
    // O estilo inline no :root tem prioridade sobre a regra do stylesheet.
    document.documentElement.style.setProperty('--primary', color);
  }
}
