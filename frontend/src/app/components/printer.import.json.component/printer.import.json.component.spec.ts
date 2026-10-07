import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterImportJsonComponent } from './printer.import.json.component';

describe('PrinterImportJsonComponent', () => {
  let component: PrinterImportJsonComponent;
  let fixture: ComponentFixture<PrinterImportJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterImportJsonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterImportJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
