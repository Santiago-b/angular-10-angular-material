import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Inject,
  OnDestroy,
  VERSION,
} from '@angular/core';
import {
  DateAdapter,
  MatDateFormats,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import {
  MatCalendar,
  MatDatepickerIntl,
  yearsPerPage,
} from '@angular/material/datepicker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  exampleHeader = CustomDPHeader;
}

@Component({
  selector: 'example-header',
  styles: [
    `
    .custom-header {
      display: flex;
      padding: 0.5em;
      align-items: center;
      padding-right:20px;
    }

    .custom-header-period-button {
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
      height: 1em;
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 16px;
      color: #0A3D7E;
      margin: 20px 0px 20px 16px;
      min-width: 0;
      width: auto;
      align-items: center;

    }

    .mat-calendar-spacer {
      flex: 1 1 auto;
    }

    .cx-calendar-previous-button,
    .cx-calendar-next-button{
      cursor: pointer;
    }

    .cx-calendar-arrow {
      height: 16px;
      width: 16px;
      background-size: 16px;
      margin-left: 8px;
      cursor: pointer;
    }

    .calendar-button-wrapper{
      display: flex;
      align-items: center;
    }

    .months-selector {
      display: flex;
      flex-direction: colum;
    }

  `,
  ],
  template: `
    <div class="custom-header">
      <div class="calendar-button-wrapper" (click)="monthClicked()">
        <button  class="custom-header-period-button">
        {{day}} | {{monthName}} | {{year}}
        </button>

        <span class="cx-calendar-arrow"
        [class.cx-calendar-invert]="calendar.currentView != 'month'">
        </span>
      </div>

      <div class="mat-calendar-spacer"></div>
      <span class="cx-calendar-previous-button" (click)="previousClicked()">
      </span>
      <span class="cx-calendar-next-button" (click)="nextClicked()">
      </span>

      <mat-grid-list class="months-selector" *ngIf="showMonthSelector" cols="3" rowHeight="2:1">
        <mat-grid-tile *ngFor="let month of monthNames; index as i" (click)="selectMonth(i)">
          {{month}}
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDPHeader<D> implements OnDestroy {
  private _destroyed = new Subject<void>();

  day: number;
  year: number;

  //<span class="cx-calendar-arrow" (click)="monthClicked()">  </span>

  public monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  currentMonthIndex: number = 0;
  monthName: string = this.monthNames[this.currentMonthIndex];
  showMonthSelector = false;

  constructor(
    private _intl: MatDatepickerIntl,
    private _calendar: MatCalendar<D>,
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    cdr: ChangeDetectorRef,
    @Inject(forwardRef(() => MatCalendar)) public calendar: MatCalendar<D>
  ) {
    _calendar.stateChanges
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => cdr.markForCheck());

    const date = this._calendar.activeDate;
    this.day = this._dateAdapter.getDate(date);
    this.monthName = this.monthNames[this._dateAdapter.getMonth(date)]; // Month index starts at 0
    this.year = this._dateAdapter.getYear(date);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(
        this._calendar.activeDate,
        this._dateFormats.display.monthYearLabel
      )
      .toLocaleUpperCase();
  }

  previousClicked() {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? -1 : -yearsPerPage
          );
  }

  nextClicked() {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? 1 : yearsPerPage
          );
  }

  changeMonth(newMonth: string) {
    const date = this._calendar.activeDate;
    const newMonthIndex = this.monthNames.indexOf(newMonth);
    if (newMonthIndex !== -1) {
      const newDate = this._dateAdapter.createDate(
        this._dateAdapter.getYear(date),
        newMonthIndex,
        this._dateAdapter.getDate(date)
      );
      this._calendar.activeDate = newDate;
    }
  }

  currentPeriodClicked(): void {
    this.calendar.currentView =
      this.calendar.currentView == 'month' ? 'multi-year' : 'month';
  }

  /** The label for the current calendar view. */
  get periodButtonText(): string {
    if (this.calendar.currentView == 'month') {
      return this._dateAdapter
        .format(
          this.calendar.activeDate,
          this._dateFormats.display.monthYearLabel
        )
        .toLocaleUpperCase();
    }
    if (this.calendar.currentView == 'year') {
      return this._dateAdapter.getYearName(this.calendar.activeDate);
    }

    // The offset from the active year to the "slot" for the starting year is the
    // *actual* first rendered year in the multi-year view, and the last year is
    // just yearsPerPage - 1 away.
    const activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
    const minYearOfPage =
      activeYear -
      this.euclideanModulo(
        activeYear -
          this.getStartingYear(
            this._dateAdapter,
            this.calendar.minDate,
            this.calendar.maxDate
          ),
        yearsPerPage
      );

    const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
    const minYearName = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(minYearOfPage, 0, 1)
    );
    const maxYearName = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(maxYearOfPage, 0, 1)
    );
    return this._intl.formatYearRange(minYearName, maxYearName);
  }

  euclideanModulo(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  getStartingYear<D>(
    dateAdapter: DateAdapter<D>,
    minDate: D | null,
    maxDate: D | null
  ): number {
    let startingYear = 0;
    if (maxDate) {
      const maxYear = dateAdapter.getYear(maxDate);
      startingYear = maxYear - yearsPerPage + 1;
    } else if (minDate) {
      startingYear = dateAdapter.getYear(minDate);
    }
    return startingYear;
  }

  monthClicked(): void {
    this.showMonthSelector = !this.showMonthSelector;
  }

  selectMonth(index: number): void {
    this.currentMonthIndex = index;
    this.monthName = this.monthNames[this.currentMonthIndex];
    this.showMonthSelector = false;
  }
}
