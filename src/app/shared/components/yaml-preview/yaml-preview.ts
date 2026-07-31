import { Component, computed, inject } from '@angular/core';
import { YamlGeneratorService } from '../../../core/services/yaml-generator.service';

@Component({
  selector: 'app-yaml-preview',
  imports: [],
  template: `
    <div class="preview-panel">
      <div class="preview-header">
        <h2>openapi.yaml</h2>
        <div class="preview-actions">
          <button class="btn btn-sm btn-outline" (click)="copyYaml()" type="button">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copiar
          </button>
          <button class="btn btn-sm btn-outline" (click)="downloadYaml()" type="button">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Descargar
          </button>
        </div>
      </div>
      <div class="preview-body">
        <pre>{{ yamlContent() }}</pre>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .preview-panel {
      background: var(--bg-subtle, #f8f9fa);
      border-left: 1px solid var(--border, #d1d5db);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 56px;
      height: calc(100vh - 56px);
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border, #d1d5db);
      background: var(--white, #ffffff);
    }

    .preview-header h2 {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary, #4a4a4a);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .preview-actions {
      display: flex;
      gap: 0.4rem;
    }

    .preview-body {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .preview-body pre {
      margin: 0;
      padding: 1rem;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
      font-size: 0.78rem;
      line-height: 1.6;
      color: var(--text, #1a1a1a);
      white-space: pre-wrap;
      word-break: break-word;
      tab-size: 2;
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

    .btn-sm {
      padding: 0.3rem 0.6rem;
      font-size: 0.78rem;
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
export class YamlPreviewComponent {
  private readonly yamlGenerator = inject(YamlGeneratorService);

  readonly yamlContent = computed(() => this.yamlGenerator.generateYaml());

  copyYaml(): void {
    const text = this.yamlContent();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showToast('Copiado al portapapeles');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast('Copiado al portapapeles');
      });
  }

  downloadYaml(): void {
    const yaml = this.yamlContent();
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

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast visible';
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
