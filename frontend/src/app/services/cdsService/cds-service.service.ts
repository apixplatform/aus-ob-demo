import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ResponseBankingAccountList, ResponseBankingAccountsBalanceById, ResponseBankingTransactionList } from "src/app/models/models";
import * as hardcoded from "src/assets/hardcoded.json";

@Injectable({
  providedIn: 'root'
})
export class CdsService {

  constructor(private http: HttpClient) { }

  getJwtToken(): Observable<any> {
    return this.http.get(hardcoded.apiRoutes.jwtTokenUrl, { responseType: 'text' });
  }

  getAccountToken(code: string, jwtToken: string): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', 'http://localhost:4200/accounts')
      .set('scope', 'openid+bank:accounts.basic:read+bank:accounts.detail:read+bank:transactions:read+bank:payees:read+bank:regular_payments:read+common:customer.basic:read+common:customer.detail:read')
      .set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
      .set('client_assertion', jwtToken);

    return this.http.post(hardcoded.apiRoutes.accessTokenUrl, null, { params });
  }

  getAccounts(token: string): Observable<ResponseBankingAccountList> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    return this.http.get(hardcoded.apiRoutes.apiBaseUrl, { headers }) as any;
  }

  getAccountBalance(token: string, accountId: string): Observable<ResponseBankingAccountsBalanceById> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    return this.http.get(hardcoded.apiRoutes.apiBaseUrl + '/' + accountId + '/balance', { headers }) as any;
  }

  getTransactionsForAccount(token: string, accountId: string): Observable<ResponseBankingTransactionList> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    return this.http.get(hardcoded.apiRoutes.apiBaseUrl + '/' + accountId + '/transactions', { headers }) as any;
  }

}
