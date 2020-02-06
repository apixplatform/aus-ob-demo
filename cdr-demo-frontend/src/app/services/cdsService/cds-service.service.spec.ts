import { TestBed } from '@angular/core/testing';

import { CdsService } from './cds-service.service';

describe('CdsServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CdsServiceService = TestBed.get(CdsServiceService);
    expect(service).toBeTruthy();
  });
});
