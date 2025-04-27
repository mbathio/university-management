// src/app/modules/communication/pipes/document-type.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DocumentType } from '../../../core/models/document.model';

@Pipe({
  name: 'documentType',
  standalone: true,
})
export class DocumentTypePipe implements PipeTransform {
  transform(value: string | DocumentType): string {
    if (typeof value === 'string') {
      value = value.toUpperCase() as DocumentType;
    }

    switch (value) {
      case DocumentType.MEETING_REPORT:
        return 'Compte rendu de réunion';
      case DocumentType.SEMINAR_REPORT:
        return 'Compte rendu de séminaire';
      case DocumentType.WEBINAR_REPORT:
        return 'Compte rendu de webinaire';
      case DocumentType.UNIVERSITY_COUNCIL:
        return "Conseil d'université";
      case DocumentType.NOTE_SERVICE:
        return 'Note de service';
      case DocumentType.CIRCULAR:
        return 'Circulaire';
      case DocumentType.ADMINISTRATIVE_NOTE:
        return 'Note administrative';
      case DocumentType.OTHER:
        return 'Autre';
      default:
        return value || 'Non spécifié';
    }
  }
}
