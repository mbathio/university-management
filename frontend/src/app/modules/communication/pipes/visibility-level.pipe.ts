// src/app/modules/communication/pipes/visibility-level-pipe.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { VisibilityLevel } from '../../../core/models/document.model';

@Pipe({
  name: 'visibilityLevel',
  standalone: true
})
export class VisibilityLevelPipe implements PipeTransform {
  transform(value: string | VisibilityLevel): string {
    switch (value) {
      case VisibilityLevel.PUBLIC:
        return 'Public';
      case VisibilityLevel.ADMINISTRATION:
        return 'Administration';
      case VisibilityLevel.TEACHERS:
        return 'Enseignants';
      case VisibilityLevel.STUDENTS:
        return 'Étudiants';
      case VisibilityLevel.RESTRICTED:
        return 'Restreint';
      default:
        return value as string;
    }
  }
}