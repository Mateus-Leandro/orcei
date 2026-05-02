import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerPageLayout } from './container-page-layout';

describe('ContainerPageLayout', () => {
  let component: ContainerPageLayout;
  let fixture: ComponentFixture<ContainerPageLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerPageLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerPageLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
