import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WizardNavComponent } from './shared/components/wizard-nav/wizard-nav';
import { YamlPreviewComponent } from './shared/components/yaml-preview/yaml-preview';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WizardNavComponent, YamlPreviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
