import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterUpdateProductComponent } from './printer.update.product.component';

describe('PrinterUpdateProductComponent', () => {
  let component: PrinterUpdateProductComponent;
  let fixture: ComponentFixture<PrinterUpdateProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterUpdateProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterUpdateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
