import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { generateId } from '../../core/utils/id-generator';
import type { Server } from '../../core/models/openapi.model';

interface ServerForm {
  id: string;
  url: string;
  description: string;
}

@Component({
  selector: 'app-servers-step',
  imports: [],
  template: `
    <div class="servers-step">
      <div class="step-header">
        <h1>Servidores</h1>
        <p>Define los servidores donde se desplegará tu API</p>
      </div>

      <div class="servers-list">
        @for (server of serversForm(); track server.id; let i = $index) {
          <div class="server-card">
            <div class="server-header">
              <span class="server-number">Servidor {{ i + 1 }}</span>
              <button class="btn btn-danger" (click)="removeServer(server.id)" type="button">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="form-group">
              <label for="url-{{ server.id }}"> URL <span class="required">*</span> </label>
              <input
                [id]="'url-' + server.id"
                type="url"
                [value]="server.url"
                (input)="updateServer(server.id, 'url', $any($event.target).value)"
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div class="form-group">
              <label for="desc-{{ server.id }}">Descripción</label>
              <input
                [id]="'desc-' + server.id"
                type="text"
                [value]="server.description"
                (input)="updateServer(server.id, 'description', $any($event.target).value)"
                placeholder="Producción"
              />
            </div>
          </div>
        }

        @if (serversForm().length === 0) {
          <div class="empty-state">
            <p>No hay servidores definidos. Añade al menos uno.</p>
          </div>
        }
      </div>

      <button class="btn btn-outline" (click)="addServer()" type="button">
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
        Añadir servidor
      </button>

      <div class="form-actions">
        <button class="btn btn-primary" (click)="saveAndNext()" type="button">
          Guardar y continuar
        </button>
      </div>
    </div>
  `,
  styles: `
    .servers-step {
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

    .servers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .server-card {
      background: var(--white, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px;
      padding: 1.5rem;
    }

    .server-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .server-number {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text, #1a1a1a);
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

    input {
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

    input:focus {
      outline: none;
      border-color: var(--teal, #046080);
      box-shadow: 0 0 0 3px rgba(4, 96, 128, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      background: var(--bg-subtle, #f8f9fa);
      border-radius: 10px;
      color: var(--text-secondary, #4a4a4a);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 2rem;
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

    .btn-primary:hover {
      background: #f5d200;
    }

    .btn-outline {
      background: transparent;
      color: var(--teal, #046080);
      border: 1px dashed var(--border, #d1d5db);
    }

    .btn-outline:hover {
      background: var(--teal-light, #e8f4f8);
      border-color: var(--teal, #046080);
    }

    .btn-danger {
      background: transparent;
      color: #dc2626;
      border: 1px solid transparent;
      padding: 0.4rem;
    }

    .btn-danger:hover {
      background: #fef2f2;
    }
  `,
})
export class ServersStepComponent implements OnInit {
  private readonly wizardState = inject(WizardStateService);
  private readonly router = inject(Router);

  readonly serversForm = signal<ServerForm[]>([]);

  constructor() {
    const servers = this.wizardState.servers();
    if (servers.length > 0) {
      this.serversForm.set(
        servers.map((s) => ({ id: s.id, url: s.url, description: s.description })),
      );
    }
  }

  ngOnInit(): void {
    this.wizardState.goToStep(2);
  }

  addServer(): void {
    const newServer: ServerForm = {
      id: generateId(),
      url: '',
      description: '',
    };
    this.serversForm.update((servers) => [...servers, newServer]);
  }

  removeServer(id: string): void {
    this.serversForm.update((servers) => servers.filter((s) => s.id !== id));
  }

  updateServer(id: string, field: keyof ServerForm, value: string): void {
    this.serversForm.update((servers) =>
      servers.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  saveAndNext(): void {
    const servers: Server[] = this.serversForm()
      .filter((s) => s.url.trim() !== '')
      .map((s) => ({
        id: s.id,
        url: s.url,
        description: s.description,
      }));

    this.wizardState.setServers(servers);
    this.wizardState.nextStep();
    this.router.navigate(['/entities']);
  }
}
