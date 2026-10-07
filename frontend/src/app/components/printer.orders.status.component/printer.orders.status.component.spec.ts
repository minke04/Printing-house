import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterOrdersStatusComponent } from './printer.orders.status.component';

describe('PrinterOrdersStatusComponent', () => {
  let component: PrinterOrdersStatusComponent;
  let fixture: ComponentFixture<PrinterOrdersStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterOrdersStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterOrdersStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
