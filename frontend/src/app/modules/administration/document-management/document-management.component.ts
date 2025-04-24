<div class="document-management-container">
  <div class="header-section">
    <h1>Gestion Documentaire</h1>
    <button mat-raised-button color="primary" (click)="addDocument()">
      <mat-icon>add</mat-icon>
      Nouveau Document
    </button>
  </div>

  <mat-card>
    <mat-card-content>
      <div class="filter-section">
        <mat-form-field appearance="outline">
          <mat-label>Rechercher un document</mat-label>
          <input
            matInput
            (keyup)="applyFilter($event)"
            placeholder="Ex. note de service"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="loading-shade" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- Title Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
            <td mat-cell *matCellDef="let document">{{ document.title }}</td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let document">
              {{ getDocumentTypeLabel(document.type) }}
            </td>
          </ng-container>

          <!-- Created Date Column -->
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              Date de création
            </th>
            <td mat-cell *matCellDef="let document">
              {{ document.createdAt | date: "dd/MM/yyyy" }}
            </td>
          </ng-container>

          <!-- Visibility Level Column -->
          <ng-container matColumnDef="visibilityLevel">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>
              Visibilité
            </th>
            <td mat-cell *matCellDef="let document">
              {{ document.visibilityLevel }}
            </td>
          </ng-container>

          <!-- Created By Column -->
          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Créé par</th>
            <td mat-cell *matCellDef="let document">
              {{ document.createdBy?.username }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let document">
              <button
                mat-icon-button
                color="primary"
                (click)="editDocument(document)"
                matTooltip="Modifier"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="deleteDocument(document)"
                matTooltip="Supprimer"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            (click)="editDocument(row)"
            class="document-row"
          ></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="6">
              <div class="no-data-message">
                <mat-icon>search_off</mat-icon>
                <p>Aucun document correspondant trouvé</p>
              </div>
            </td>
          </tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[5, 10, 25, 100]"
          [pageSize]="10"
          showFirstLastButtons
        ></mat-paginator>
      </div>
    </mat-card-content>
  </mat-card>
</div>