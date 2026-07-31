import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { YamlImportService } from '../../core/services/yaml-import.service';
import { createEmptyState } from '../../core/constants/templates';

@Component({
  selector: 'app-welcome',
  imports: [],
  template: `
    <div class="welcome-step">
      <div class="welcome-header">
        <div class="welcome-icon">
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>Configurador OpenAPI 3.0.3</h1>
        <p class="welcome-subtitle">
          Completa los pasos para generar tu especificación OpenAPI. Elige cómo quieres empezar.
        </p>
      </div>

      <div class="options-grid">
        <button class="option-card" (click)="startEmpty()" type="button">
          <div class="option-icon">
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>Documento vacío</h3>
          <p>Comienza desde cero y configura cada sección manualmente</p>
        </button>

        <button class="option-card" (click)="startUpload()" type="button">
          <div class="option-icon">
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>Subir YAML</h3>
          <p>Carga tu propio archivo openapi.yaml y modifícalo</p>
        </button>
      </div>
    </div>
  `,
  styles: `
    .welcome-step {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: var(--teal-light, #e8f4f8);
      color: var(--teal, #046080);
      margin-bottom: 1.5rem;
    }

    .welcome-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text, #1a1a1a);
      margin: 0 0 0.5rem 0;
    }

    .welcome-subtitle {
      font-size: 1rem;
      color: var(--text-secondary, #4a4a4a);
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .option-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 1.5rem;
      border: 2px solid var(--border-light, #e5e7eb);
      border-radius: 12px;
      background: var(--white, #ffffff);
      cursor: pointer;
      transition: all 200ms ease;
      text-align: left;
    }

    .option-card:hover {
      border-color: var(--teal, #046080);
      background: var(--teal-light, #e8f4f8);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(4, 96, 128, 0.15);
    }

    .option-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--yellow-light, #fff8cc);
      color: var(--teal, #046080);
      margin-bottom: 1rem;
    }

    .option-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text, #1a1a1a);
      margin: 0 0 0.5rem 0;
    }

    .option-card p {
      font-size: 0.9rem;
      color: var(--text-secondary, #4a4a4a);
      margin: 0;
      line-height: 1.5;
    }
  `,
})
export class WelcomeComponent {
  private readonly router = inject(Router);
  private readonly wizardState = inject(WizardStateService);
  private readonly yamlImport = inject(YamlImportService);

  startEmpty(): void {
    this.wizardState.resetState();
    const state = createEmptyState();
    state.currentStep = 1;
    this.wizardState.loadFullState(state);
    this.router.navigate(['/info']);
  }

  startUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const yamlContent = reader.result as string;
            this.wizardState.resetState();
            const state = this.yamlImport.import(yamlContent);
            this.wizardState.loadFullState(state);
            this.router.navigate(['/info']);
          } catch {
            alert(
              'Error al cargar el archivo YAML. Asegúrate de que es un archivo OpenAPI válido.',
            );
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}
