import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterBidsComponent } from './printer.bids.component';

describe('PrinterBidsComponent', () => {
  let component: PrinterBidsComponent;
  let fixture: ComponentFixture<PrinterBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterBidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
