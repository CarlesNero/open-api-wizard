import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { YamlGeneratorService } from '../../core/services/yaml-generator.service';

@Component({
  selector: 'app-review-step',
  imports: [],
  template: `
    <div class="review-step">
      <div class="step-header">
        <h1>Revisión final</h1>
        <p>Revisa tu especificación, edita lo que necesites y descárgala cuando estés listo</p>
      </div>

      <div class="summary-section">
        <div class="summary-card">
          <h2>Resumen</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Título</span>
              <span class="summary-value">{{ info().title || '—' }}</span>
              <button class="edit-link" (click)="goToStep('/info')" type="button">Editar</button>
            </div>
            <div class="summary-item">
              <span class="summary-label">Versión</span>
              <span class="summary-value">{{ info().version || '—' }}</span>
              <button class="edit-link" (click)="goToStep('/info')" type="button">Editar</button>
            </div>
            <div class="summary-item">
              <span class="summary-label">Servidores</span>
              <span class="summary-value">{{ servers().length }}</span>
              <button class="edit-link" (click)="goToStep('/servers')" type="button">Editar</button>
            </div>
            <div class="summary-item">
              <span class="summary-label">Entidades</span>
              <span class="summary-value">{{ entities().length }}</span>
              <button class="edit-link" (click)="goToStep('/entities')" type="button">
                Editar
              </button>
            </div>
            <div class="summary-item">
              <span class="summary-label">Paths</span>
              <span class="summary-value">{{ paths().length }}</span>
              <button class="edit-link" (click)="goToStep('/entities')" type="button">
                Editar
              </button>
            </div>
            <div class="summary-item">
              <span class="summary-label">Schemas</span>
              <span class="summary-value">{{ schemas().length }}</span>
              <button class="edit-link" (click)="goToStep('/entities')" type="button">
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="btn btn-primary btn-large" (click)="downloadYaml()" type="button">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Descargar openapi.yaml
        </button>

        <div class="secondary-actions">
          <button class="btn btn-outline" (click)="copyYaml()" type="button">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copiar YAML
          </button>
          <button class="btn btn-outline" (click)="startNew()" type="button">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo contrato
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .review-step {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .step-header {
      margin-bottom: 2rem;
    }

    .step-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text, #1a1a1a);
      margin: 0 0 0.5rem 0;
    }

    .step-header p {
      font-size: 1rem;
      color: var(--text-secondary, #4a4a4a);
      margin: 0;
    }

    .summary-section {
      margin-bottom: 2rem;
    }

    .summary-card {
      background: var(--white, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px;
      padding: 1.5rem;
    }

    .summary-card h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text, #1a1a1a);
      margin: 0 0 1rem 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary, #4a4a4a);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--teal, #046080);
    }

    .edit-link {
      background: none;
      border: none;
      color: var(--teal, #046080);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      text-align: left;
      width: fit-content;
    }

    .edit-link:hover {
      color: var(--teal-dark, #034a63);
    }

    .actions-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
    }

    .secondary-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 150ms ease;
    }

    .btn-primary {
      background: var(--yellow, #ffdb00);
      color: var(--black, #000000);
    }

    .btn-primary:hover {
      background: #f5d200;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 219, 0, 0.3);
    }

    .btn-outline {
      background: transparent;
      color: var(--teal, #046080);
      border: 1px solid var(--border, #d1d5db);
    }

    .btn-outline:hover {
      background: var(--teal-light, #e8f4f8);
      border-color: var(--teal, #046080);
    }
  `,
})
export class ReviewStepComponent implements OnInit {
  private readonly wizardState = inject(WizardStateService);
  private readonly yamlGenerator = inject(YamlGeneratorService);
  private readonly router = inject(Router);

  readonly info = this.wizardState.info;
  readonly servers = this.wizardState.servers;
  readonly entities = this.wizardState.entities;
  readonly paths = this.wizardState.paths;
  readonly schemas = this.wizardState.schemas;

  ngOnInit(): void {
    this.wizardState.goToStep(4);
    this.wizardState.markCompleted();
  }

  goToStep(route: string): void {
    this.router.navigate([route]);
  }

  downloadYaml(): void {
    const yaml = this.yamlGenerator.generateYaml();
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('YAML descargado');
  }

  copyYaml(): void {
    const yaml = this.yamlGenerator.generateYaml();
    navigator.clipboard
      .writeText(yaml)
      .then(() => {
        this.showToast('Copiado al portapapeles');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = yaml;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('Copiado al portapapeles');
      });
  }

  startNew(): void {
    this.wizardState.resetState();
    this.router.navigate(['/welcome']);
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div class="toast-accent"></div>
      <span>${message}</span>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--black, #000000);
      color: var(--white, #ffffff);
      padding: 0.65rem 1.2rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      z-index: 1000;
      opacity: 1;
      transition: all 300ms ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2200);
  }
}
