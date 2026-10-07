import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterAddProductComponent } from './printer.add.product.component';

describe('PrinterAddProductComponent', () => {
  let component: PrinterAddProductComponent;
  let fixture: ComponentFixture<PrinterAddProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterAddProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterAddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
