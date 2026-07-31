import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import type { ApiInfo } from '../../core/models/openapi.model';

@Component({
  selector: 'app-info-step',
  imports: [ReactiveFormsModule],
  template: `
    <div class="info-step">
      <div class="step-header">
        <h1>Información de la API</h1>
        <p>Define los datos básicos de tu especificación OpenAPI</p>
      </div>

      <form [formGroup]="infoForm" class="info-form">
        <div class="form-section">
          <h2>Datos básicos</h2>

          <div class="form-group">
            <label for="title"> Título <span class="required">*</span> </label>
            <input id="title" type="text" [formControl]="titleControl" placeholder="Mi API" />
            @if (titleControl.invalid && titleControl.touched) {
              <span class="error-message">El título es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              [formControl]="descriptionControl"
              placeholder="Descripción de la API..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="version"> Versión <span class="required">*</span> </label>
              <input id="version" type="text" [formControl]="versionControl" placeholder="1.0.0" />
              @if (versionControl.invalid && versionControl.touched) {
                <span class="error-message">La versión es obligatoria</span>
              }
            </div>
            <div class="form-group">
              <label for="termsOfService">Terms of Service</label>
              <input
                id="termsOfService"
                type="url"
                [formControl]="termsControl"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Contacto</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="contactName">Nombre</label>
              <input
                id="contactName"
                type="text"
                [formControl]="contactNameControl"
                placeholder="Equipo de desarrollo"
              />
            </div>
            <div class="form-group">
              <label for="contactEmail">Email</label>
              <input
                id="contactEmail"
                type="email"
                [formControl]="contactEmailControl"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="contactUrl">URL</label>
            <input
              id="contactUrl"
              type="url"
              [formControl]="contactUrlControl"
              placeholder="https://..."
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Licencia</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="licenseName">Nombre</label>
              <input
                id="licenseName"
                type="text"
                [formControl]="licenseNameControl"
                placeholder="Apache 2.0"
              />
            </div>
            <div class="form-group">
              <label for="licenseUrl">URL</label>
              <input
                id="licenseUrl"
                type="url"
                [formControl]="licenseUrlControl"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-primary"
            (click)="saveAndNext()"
            [disabled]="infoForm.invalid"
          >
            Guardar y continuar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .info-step {
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

    .info-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      background: var(--white, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px;
      padding: 1.5rem;
    }

    .form-section h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text, #1a1a1a);
      margin: 0 0 1rem 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary, #4a4a4a);
    }

    .required {
      color: #dc2626;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--text, #1a1a1a);
      background: var(--white, #ffffff);
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--teal, #046080);
      box-shadow: 0 0 0 3px rgba(4, 96, 128, 0.1);
    }

    input:disabled,
    textarea:disabled {
      background: var(--bg-subtle, #f8f9fa);
      cursor: not-allowed;
    }

    textarea {
      resize: vertical;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .error-message {
      font-size: 0.8rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light, #e5e7eb);
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

    .btn-primary:hover:not(:disabled) {
      background: #f5d200;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class InfoStepComponent implements OnInit {
  private readonly wizardState = inject(WizardStateService);
  private readonly router = inject(Router);

  readonly titleControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly descriptionControl = new FormControl('', { nonNullable: true });
  readonly versionControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly termsControl = new FormControl('', { nonNullable: true });
  readonly contactNameControl = new FormControl('', { nonNullable: true });
  readonly contactEmailControl = new FormControl('', { nonNullable: true });
  readonly contactUrlControl = new FormControl('', { nonNullable: true });
  readonly licenseNameControl = new FormControl('', { nonNullable: true });
  readonly licenseUrlControl = new FormControl('', { nonNullable: true });

  readonly infoForm = new FormGroup({
    title: this.titleControl,
    description: this.descriptionControl,
    version: this.versionControl,
    termsOfService: this.termsControl,
    contactName: this.contactNameControl,
    contactEmail: this.contactEmailControl,
    contactUrl: this.contactUrlControl,
    licenseName: this.licenseNameControl,
    licenseUrl: this.licenseUrlControl,
  });

  private readonly currentInfo = this.wizardState.info;

  constructor() {
    effect(() => {
      const info = this.currentInfo();
      if (info.title) {
        this.infoForm.patchValue({
          title: info.title,
          description: info.description,
          version: info.version,
          termsOfService: info.termsOfService,
          contactName: info.contact.name,
          contactEmail: info.contact.email,
          contactUrl: info.contact.url,
          licenseName: info.license.name,
          licenseUrl: info.license.url,
        });
      }
    });
  }

  ngOnInit(): void {
    this.wizardState.goToStep(1);
  }

  saveAndNext(): void {
    if (this.infoForm.invalid) return;

    const info: ApiInfo = {
      title: this.titleControl.value,
      description: this.descriptionControl.value,
      version: this.versionControl.value,
      termsOfService: this.termsControl.value,
      contact: {
        name: this.contactNameControl.value,
        email: this.contactEmailControl.value,
        url: this.contactUrlControl.value,
      },
      license: {
        name: this.licenseNameControl.value,
        url: this.licenseUrlControl.value,
      },
    };

    this.wizardState.setInfo(info);
    this.wizardState.nextStep();
    this.router.navigate(['/servers']);
  }
}
