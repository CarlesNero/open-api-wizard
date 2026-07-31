import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { buildStateFromEntities } from '../../core/constants/templates';
import { generateId } from '../../core/utils/id-generator';
import type { Entity, SchemaProperty } from '../../core/models/openapi.model';

interface PropertyForm {
  id: string;
  name: string;
  type: string;
  format: string;
  description: string;
  example: string;
  required: boolean;
  nullable: boolean;
  maxLength: string;
  ref: string;
}

interface EntityForm {
  id: string;
  name: string;
  tableName: string;
  path: string;
  description: string;
  idField: string;
  pkComment: string;
  generateCrud: boolean;
  expanded: boolean;
  properties: PropertyForm[];
}

@Component({
  selector: 'app-entities-step',
  imports: [],
  template: `
    <div class="entities-step">
      <div class="step-header">
        <h1>Entidades</h1>
        <p>Define las entidades de tu API. Marca las que necesitan operaciones CRUD completas.</p>
      </div>

      <div class="entities-list">
        @for (entity of entitiesForm(); track entity.id; let i = $index) {
          <div class="entity-card" [class.expanded]="entity.expanded">
            <div class="entity-header">
              <button
                class="expand-btn"
                (click)="toggleEntity(entity.id)"
                type="button"
                [attr.aria-expanded]="entity.expanded"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  [style.transform]="entity.expanded ? 'rotate(90deg)' : 'none'"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div class="entity-title">
                <span class="entity-number">{{ entity.name || 'Entidad ' + (i + 1) }}</span>
                @if (entity.generateCrud) {
                  <span class="crud-badge">CRUD</span>
                }
              </div>
              <button class="btn btn-danger" (click)="removeEntity(entity.id)" type="button">
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

            <div class="entity-metadata">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre de la entidad <span class="required">*</span></label>
                  <input
                    type="text"
                    [value]="entity.name"
                    (input)="updateEntity(entity.id, 'name', $any($event.target).value)"
                    placeholder="MiEntidad"
                  />
                </div>
                <div class="form-group">
                  <label>Nombre de tabla</label>
                  <input
                    type="text"
                    [value]="entity.tableName"
                    (input)="updateEntity(entity.id, 'tableName', $any($event.target).value)"
                    placeholder="MI_ENTIDAD"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Path</label>
                  <input
                    type="text"
                    [value]="entity.path"
                    (input)="updateEntity(entity.id, 'path', $any($event.target).value)"
                    placeholder="/mi-entidad"
                  />
                </div>
                <div class="form-group">
                  <label>Campo ID</label>
                  <input
                    type="text"
                    [value]="entity.idField"
                    (input)="updateEntity(entity.id, 'idField', $any($event.target).value)"
                    placeholder="idMiEntidad"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  [value]="entity.description"
                  (input)="updateEntity(entity.id, 'description', $any($event.target).value)"
                  placeholder="Descripción de la entidad"
                />
              </div>

              <div class="form-group">
                <label>Comentario PK</label>
                <input
                  type="text"
                  [value]="entity.pkComment"
                  (input)="updateEntity(entity.id, 'pkComment', $any($event.target).value)"
                  placeholder="Identificador único de la entidad"
                />
              </div>

              <div class="crud-toggle">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="entity.generateCrud"
                    (change)="updateEntity(entity.id, 'generateCrud', $any($event.target).checked)"
                  />
                  <span>Generar CRUD completo para esta entidad</span>
                </label>
              </div>
            </div>

            @if (entity.expanded) {
              <div class="properties-section">
                <h3>Propiedades</h3>

                @if (entity.properties.length > 0) {
                  <div class="properties-table">
                    <div class="properties-header">
                      <span>Nombre</span>
                      <span>Tipo</span>
                      <span>Formato</span>
                      <span>Req.</span>
                      <span></span>
                    </div>

                    @for (prop of entity.properties; track prop.id) {
                      <div class="property-row">
                        <input
                          type="text"
                          [value]="prop.name"
                          (input)="
                            updateProperty(entity.id, prop.id, 'name', $any($event.target).value)
                          "
                          placeholder="propiedad"
                          [readonly]="prop.name === 'id'"
                          [class.readonly]="prop.name === 'id'"
                        />
                        <select
                          [value]="prop.type"
                          (change)="
                            updateProperty(entity.id, prop.id, 'type', $any($event.target).value)
                          "
                          [disabled]="prop.name === 'id'"
                        >
                          <option value="string">string</option>
                          <option value="integer">integer</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                          <option value="array">array</option>
                          <option value="object">object</option>
                        </select>
                        <input
                          type="text"
                          [value]="prop.format"
                          (input)="
                            updateProperty(entity.id, prop.id, 'format', $any($event.target).value)
                          "
                          placeholder="int32"
                          [readonly]="prop.name === 'id'"
                          [class.readonly]="prop.name === 'id'"
                        />
                        <label class="checkbox-cell">
                          <input
                            type="checkbox"
                            [checked]="prop.required"
                            [disabled]="prop.name === 'id'"
                            (change)="
                              updateProperty(
                                entity.id,
                                prop.id,
                                'required',
                                $any($event.target).checked
                              )
                            "
                          />
                        </label>
                        <button
                          class="btn-icon"
                          (click)="removeProperty(entity.id, prop.id)"
                          type="button"
                          [disabled]="prop.name === 'id'"
                          [class.btn-disabled]="prop.name === 'id'"
                        >
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

                      <div class="property-details">
                        <input
                          type="text"
                          [value]="prop.description"
                          (input)="
                            updateProperty(
                              entity.id,
                              prop.id,
                              'description',
                              $any($event.target).value
                            )
                          "
                          placeholder="Descripción"
                          [readonly]="prop.name === 'id'"
                          [class.readonly]="prop.name === 'id'"
                        />
                        <input
                          type="text"
                          [value]="prop.example"
                          (input)="
                            updateProperty(entity.id, prop.id, 'example', $any($event.target).value)
                          "
                          placeholder="Ejemplo"
                          [readonly]="prop.name === 'id'"
                          [class.readonly]="prop.name === 'id'"
                        />
                      </div>
                      @if (prop.type === 'object') {
                        <div class="property-ref">
                          <input
                            type="text"
                            [value]="prop.ref || '#/components/schemas/'"
                            (input)="
                              updateProperty(entity.id, prop.id, 'ref', $any($event.target).value)
                            "
                            (focus)="onRefFocus(entity.id, prop)"
                            placeholder="#/components/schemas/NombreSchema"
                            class="ref-input"
                          />
                        </div>
                      }
                    }
                  </div>
                }

                <button class="btn btn-outline-sm" (click)="addProperty(entity.id)" type="button">
                  + Propiedad
                </button>
              </div>
            }
          </div>
        }

        @if (entitiesForm().length === 0) {
          <div class="empty-state">
            <p>No hay entidades definidas. Añade una para comenzar.</p>
          </div>
        }
      </div>

      <button class="btn btn-outline" (click)="addEntity()" type="button">
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
        Añadir entidad
      </button>

      <div class="form-actions">
        <button class="btn btn-primary" (click)="saveAndNext()" type="button">
          Guardar y continuar
        </button>
      </div>
    </div>
  `,
  styles: `
    .entities-step {
      max-width: 1000px;
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

    .entities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .entity-card {
      background: var(--white, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px;
      overflow: hidden;
    }

    .entity-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--bg-subtle, #f8f9fa);
      border-bottom: 1px solid var(--border-light, #e5e7eb);
    }

    .expand-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      color: var(--text-secondary, #4a4a4a);
      transition: transform 150ms ease;
    }

    .entity-title {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .entity-number {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text, #1a1a1a);
    }

    .crud-badge {
      display: inline-flex;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      background: var(--teal-light, #e8f4f8);
      color: var(--teal, #046080);
    }

    .entity-metadata {
      padding: 1rem;
      display: none;
    }

    .entity-card.expanded .entity-metadata {
      display: block;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary, #4a4a4a);
    }

    .required {
      color: #dc2626;
    }

    input,
    select {
      width: 100%;
      padding: 0.5rem 0.7rem;
      border: 1px solid var(--border, #d1d5db);
      border-radius: 6px;
      font-size: 0.85rem;
      font-family: inherit;
      color: var(--text, #1a1a1a);
      background: var(--white, #ffffff);
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--teal, #046080);
      box-shadow: 0 0 0 3px rgba(4, 96, 128, 0.1);
    }

    .crud-toggle {
      padding: 0.75rem;
      background: var(--yellow-light, #fff8cc);
      border: 1px solid var(--yellow, #ffdb00);
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text, #1a1a1a);
    }

    .checkbox-label input[type='checkbox'] {
      width: 18px;
      height: 18px;
      accent-color: var(--teal, #046080);
    }

    .properties-section {
      padding: 1rem;
      border-top: 1px solid var(--border-light, #e5e7eb);
    }

    .properties-section h3 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      color: var(--text, #1a1a1a);
    }

    .properties-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .properties-header {
      display: grid;
      grid-template-columns: 1fr 100px 80px 50px 30px;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-secondary, #4a4a4a);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 0.3rem 0;
      border-bottom: 1px solid var(--border-light, #e5e7eb);
    }

    .property-row {
      display: grid;
      grid-template-columns: 1fr 100px 80px 50px 30px;
      gap: 0.4rem;
      align-items: center;
    }

    .property-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }

    .checkbox-cell {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkbox-cell input {
      width: 16px;
      height: 16px;
      accent-color: var(--teal, #046080);
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dc2626;
      border-radius: 4px;
      transition: background 150ms ease;
    }

    .btn-icon:hover {
      background: #fef2f2;
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

    .btn-outline-sm {
      background: transparent;
      color: var(--teal, #046080);
      border: 1px dashed var(--border, #d1d5db);
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-outline-sm:hover {
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

    .property-ref {
      margin-top: 0.5rem;
    }

    .ref-input {
      width: 100%;
      padding: 0.5rem;
      background: var(--gray-50, #f9fafb);
      border: 1px dashed var(--gray-300, #d1d5db);
      border-radius: 4px;
      font-size: 0.875rem;
      color: var(--gray-700, #374151);
      font-family: monospace;
    }

    .ref-input:focus {
      outline: none;
      border-color: var(--teal, #046080);
      background: var(--white, #ffffff);
    }

    .ref-input::placeholder {
      color: var(--gray-400, #9ca3af);
      font-style: italic;
    }

    input.readonly,
    select:disabled {
      background: var(--gray-100, #f3f4f6);
      color: var(--gray-500, #6b7280);
      cursor: not-allowed;
    }

    .btn-disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
  `,
})
export class EntitiesStepComponent implements OnInit {
  private readonly wizardState = inject(WizardStateService);
  private readonly router = inject(Router);

  readonly entitiesForm = signal<EntityForm[]>([]);

  constructor() {
    const entities = this.wizardState.entities();
    if (entities.length > 0) {
      this.entitiesForm.set(
        entities.map((e) => ({
          id: e.id,
          name: e.name,
          tableName: e.tableName,
          path: e.path,
          description: e.description,
          idField: e.idField,
          pkComment: e.pkComment,
          generateCrud: e.generateCrud,
          expanded: false,
          properties: e.properties.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            format: p.format,
            description: p.description,
            example: p.example,
            required: p.required,
            nullable: p.nullable,
            maxLength: p.maxLength,
            ref: p.ref,
          })),
        })),
      );
    }
  }

  ngOnInit(): void {
    this.wizardState.goToStep(3);
  }

  addEntity(): void {
    const newEntity: EntityForm = {
      id: generateId(),
      name: '',
      tableName: '',
      path: '',
      description: '',
      idField: '',
      pkComment: '',
      generateCrud: true,
      expanded: true,
      properties: [],
    };
    this.entitiesForm.update((entities) => [...entities, newEntity]);
  }

  removeEntity(id: string): void {
    this.entitiesForm.update((entities) => entities.filter((e) => e.id !== id));
  }

  toggleEntity(id: string): void {
    this.entitiesForm.update((entities) =>
      entities.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );
  }

  updateEntity(id: string, field: keyof EntityForm, value: string | boolean): void {
    this.entitiesForm.update((entities) =>
      entities.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }

  addProperty(entityId: string): void {
    const newProp: PropertyForm = {
      id: generateId(),
      name: '',
      type: 'string',
      format: '',
      description: '',
      example: '',
      required: false,
      nullable: false,
      maxLength: '',
      ref: '',
    };
    this.entitiesForm.update((entities) =>
      entities.map((e) =>
        e.id === entityId ? { ...e, properties: [...e.properties, newProp] } : e,
      ),
    );
  }

  removeProperty(entityId: string, propId: string): void {
    this.entitiesForm.update((entities) =>
      entities.map((e) =>
        e.id === entityId ? { ...e, properties: e.properties.filter((p) => p.id !== propId) } : e,
      ),
    );
  }

  updateProperty(
    entityId: string,
    propId: string,
    field: keyof PropertyForm,
    value: string | boolean,
  ): void {
    this.entitiesForm.update((entities) =>
      entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              properties: e.properties.map((p) => (p.id === propId ? { ...p, [field]: value } : p)),
            }
          : e,
      ),
    );
  }

  onRefFocus(entityId: string, prop: PropertyForm): void {
    if (!prop.ref) {
      this.updateProperty(entityId, prop.id, 'ref', '#/components/schemas/');
    }
  }

  saveAndNext(): void {
    const entities = this.entitiesForm();

    if (entities.filter((e) => e.name.trim() !== '').length === 0) {
      this.showError('Debes definir al menos una entidad para continuar');
      return;
    }

    const mappedEntities: Entity[] = entities
      .filter((e) => e.name.trim() !== '')
      .map((e) => ({
        id: e.id,
        name: e.name,
        tableName: e.tableName,
        path: e.path,
        description: e.description,
        idField: e.idField,
        pkComment: e.pkComment,
        generateCrud: e.generateCrud,
        properties: e.properties
          .filter((p) => p.name.trim() !== '')
          .map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            format: p.format,
            description: p.description,
            example: p.example,
            minimum: '',
            maximum: '',
            pattern: '',
            required: p.required,
            ref: p.ref,
            enumValues: [],
            nullable: p.nullable,
            maxLength: p.maxLength,
          })),
      }));

    const currentState = this.wizardState.state();
    const updatedState = buildStateFromEntities(
      currentState.info,
      currentState.servers,
      mappedEntities,
    );

    this.wizardState.loadFullState({
      ...updatedState,
      currentStep: 4,
      completed: true,
    });

    this.router.navigate(['/review']);
  }

  private showError(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #dc2626;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}
