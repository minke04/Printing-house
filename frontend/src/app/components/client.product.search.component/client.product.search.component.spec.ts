import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProductSearchComponent } from './client.product.search.component';

describe('ClientProductSearchComponent', () => {
  let component: ClientProductSearchComponent;
  let fixture: ComponentFixture<ClientProductSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProductSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProductSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
