import { computed, Injectable, signal } from '@angular/core';
import type {
  ApiInfo,
  Entity,
  GlobalSecurity,
  Path,
  RequestBody,
  Response,
  Schema,
  SecurityScheme,
  Server,
  WizardState,
} from '../models/openapi.model';
import { createEmptyState } from '../constants/templates';

const STORAGE_KEY = 'open-api-wizard-state';

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly stateSignal = signal<WizardState>(this.loadFromStorage() ?? createEmptyState());

  readonly state = this.stateSignal.asReadonly();

  readonly currentStep = computed(() => this.stateSignal().currentStep);
  readonly info = computed(() => this.stateSignal().info);
  readonly servers = computed(() => this.stateSignal().servers);
  readonly entities = computed(() => this.stateSignal().entities);
  readonly paths = computed(() => this.stateSignal().paths);
  readonly schemas = computed(() => this.stateSignal().schemas);
  readonly requestBodies = computed(() => this.stateSignal().requestBodies);
  readonly responses = computed(() => this.stateSignal().responses);
  readonly globalSecurity = computed(() => this.stateSignal().globalSecurity);
  readonly securitySchemes = computed(() => this.stateSignal().securitySchemes);
  readonly isCompleted = computed(() => this.stateSignal().completed);

  readonly totalSteps = 5;

  setInfo(info: ApiInfo): void {
    this.updateState((s) => ({ ...s, info }));
  }

  setServers(servers: Server[]): void {
    this.updateState((s) => ({ ...s, servers }));
  }

  setEntities(entities: Entity[]): void {
    this.updateState((s) => ({ ...s, entities }));
  }

  setPaths(paths: Path[]): void {
    this.updateState((s) => ({ ...s, paths }));
  }

  setSchemas(schemas: Schema[]): void {
    this.updateState((s) => ({ ...s, schemas }));
  }

  setRequestBodies(requestBodies: RequestBody[]): void {
    this.updateState((s) => ({ ...s, requestBodies }));
  }

  setResponses(responses: Response[]): void {
    this.updateState((s) => ({ ...s, responses }));
  }

  setGlobalSecurity(globalSecurity: GlobalSecurity[]): void {
    this.updateState((s) => ({ ...s, globalSecurity }));
  }

  setSecuritySchemes(securitySchemes: SecurityScheme[]): void {
    this.updateState((s) => ({ ...s, securitySchemes }));
  }

  goToStep(step: number): void {
    this.updateState((s) => ({ ...s, currentStep: step }));
  }

  nextStep(): void {
    const current = this.stateSignal().currentStep;
    if (current < this.totalSteps - 1) {
      this.updateState((s) => ({ ...s, currentStep: current + 1 }));
    }
  }

  previousStep(): void {
    const current = this.stateSignal().currentStep;
    if (current > 0) {
      this.updateState((s) => ({ ...s, currentStep: current - 1 }));
    }
  }

  loadFullState(state: WizardState): void {
    this.stateSignal.set(state);
    this.persistToStorage();
  }

  resetState(): void {
    this.stateSignal.set(createEmptyState());
    this.clearStorage();
  }

  markCompleted(): void {
    this.updateState((s) => ({ ...s, completed: true }));
  }

  private updateState(updater: (state: WizardState) => WizardState): void {
    this.stateSignal.update(updater);
    this.persistToStorage();
  }

  private persistToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stateSignal()));
    } catch {
      console.warn('Failed to persist wizard state to localStorage');
    }
  }

  private loadFromStorage(): WizardState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as WizardState;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.warn('Failed to clear wizard state from localStorage');
    }
  }
}
