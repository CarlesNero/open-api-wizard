import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-wizard-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="wizard-nav">
      <div class="step-indicators">
        @for (step of steps; track step.index; let i = $index) {
          <a
            [routerLink]="step.route"
            routerLinkActive="active"
            [class.completed]="isStepCompleted(step.index)"
            [class.current]="isCurrentStep(step.index)"
            class="step-indicator"
            (click)="onStepClick(step.index)"
          >
            <span class="step-number">{{ step.index + 1 }}</span>
            <span class="step-label">{{ step.label }}</span>
          </a>
        }
      </div>
      <div class="nav-actions">
        @if (currentStep() > 0) {
          <button class="btn btn-secondary" (click)="previousStep()" type="button">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        }
        @if (currentStep() < totalSteps - 1) {
          <button class="btn btn-primary" (click)="nextStep()" type="button">
            Siguiente
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .wizard-nav {
      background: var(--white, #ffffff);
      border-bottom: 1px solid var(--border, #d1d5db);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .step-indicators {
      display: flex;
      gap: 0.5rem;
      flex: 1;
      overflow-x: auto;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
      color: var(--text-secondary, #4a4a4a);
      background: var(--bg-subtle, #f8f9fa);
      transition: all 150ms ease;
      white-space: nowrap;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .step-indicator:hover {
      background: var(--teal-light, #e8f4f8);
      color: var(--teal, #046080);
    }

    .step-indicator.active {
      background: var(--teal, #046080);
      color: var(--white, #ffffff);
    }

    .step-indicator.completed {
      background: var(--teal-light, #e8f4f8);
      color: var(--teal, #046080);
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      font-weight: 600;
      font-size: 0.75rem;
    }

    .step-indicator.active .step-number {
      background: rgba(255, 255, 255, 0.3);
    }

    .step-indicator.completed .step-number {
      background: var(--teal, #046080);
      color: var(--white, #ffffff);
    }

    .step-label {
      font-weight: 500;
    }

    .nav-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 550;
      cursor: pointer;
      border: none;
      transition: all 150ms ease;
      white-space: nowrap;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--yellow, #ffdb00);
      color: var(--black, #000000);
    }

    .btn-primary:hover {
      background: #f5d200;
    }

    .btn-secondary {
      background: var(--bg-subtle, #f8f9fa);
      color: var(--text, #1a1a1a);
      border: 1px solid var(--border, #d1d5db);
    }

    .btn-secondary:hover {
      background: var(--border-light, #e5e7eb);
    }
  `,
})
export class WizardNavComponent {
  private readonly wizardState = inject(WizardStateService);
  private readonly router = inject(Router);

  readonly currentStep = this.wizardState.currentStep;
  readonly totalSteps = this.wizardState.totalSteps;

  readonly steps = [
    { index: 0, label: 'Bienvenida', route: '/welcome' },
    { index: 1, label: 'Información', route: '/info' },
    { index: 2, label: 'Servidores', route: '/servers' },
    { index: 3, label: 'Entidades', route: '/entities' },
    { index: 4, label: 'Revisión', route: '/review' },
  ];

  isCurrentStep(stepIndex: number): boolean {
    return this.currentStep() === stepIndex;
  }

  isStepCompleted(stepIndex: number): boolean {
    return this.currentStep() > stepIndex;
  }

  nextStep(): void {
    const next = this.currentStep() + 1;
    if (next < this.totalSteps) {
      this.wizardState.goToStep(next);
      this.router.navigate([this.steps[next].route]);
    }
  }

  previousStep(): void {
    const prev = this.currentStep() - 1;
    if (prev >= 0) {
      this.wizardState.goToStep(prev);
      this.router.navigate([this.steps[prev].route]);
    }
  }

  onStepClick(stepIndex: number): void {
    this.wizardState.goToStep(stepIndex);
  }
}
