import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ResponseBankingAccountList, ResponseBankingAccountsBalanceById, ResponseBankingTransactionList } from "src/app/models/models";
import * as hardcoded from "src/assets/config/property.json";

@Injectable({
  providedIn: 'root'
})
export class CdsService {

  constructor(private http: HttpClient) { }


  /**
   * calls local backend to get jwt encoded Client Assertion
   */
  getAuthorizeUrl(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let body = {
      "aud": `${hardcoded.ob.baseUrl}${hardcoded.ob.tokenEndpoint}`,
      "response_type": "code id_token",
      "client_id": hardcoded.ob.clientId,
      "redirect_uri": `${hardcoded.frontend.baseUrl}${hardcoded.frontend.redirectUrl}`,
      "scope": "openid bank:accounts.basic:read bank:accounts.detail:read bank:transactions:read bank:payees:read bank:regular_payments:read common:customer.basic:read common:customer.detail:read",
      "state": "suite",
      "claims": {
        "sharing_duration": 60000,
        "id_token": {
          "acr": {
            "values": [
              "urn:cds.au:cdr:3"
            ]
          }
        }
      }
    }
    return this.http.post(hardcoded.backend.baseUrl + hardcoded.backend.authorizeUrlEndpoint, body, httpOptions);
  }

  /**
   * calls local backend to get jwt encoded Client Assertion
   */
  getClientAssertion(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let body = {
      "iss": hardcoded.ob.clientId,
      "aud": `${hardcoded.ob.baseUrl}${hardcoded.ob.tokenEndpoint}`
    };
    return this.http.post(hardcoded.backend.baseUrl + hardcoded.backend.clientAssertionEndpoint, body, httpOptions);

    // return this.http.get(hardcoded.backend.baseUrl + hardcoded.backend.clientAssertionEndpoint, { responseType: 'text' });
  }

  /**
   * Get bearer token by posting to this endpoint.
   * @param code the account access code from Identity Server
   * @param jwtToken the client assertion
   */
  getAccountToken(code: string, clientAssertion: string): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', `${hardcoded.frontend.baseUrl}${hardcoded.frontend.redirectUrl}`)
      .set('scope', 'openid+bank:accounts.basic:read+bank:accounts.detail:read+bank:transactions:read+bank:payees:read+bank:regular_payments:read+common:customer.basic:read+common:customer.detail:read')
      .set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
      .set('client_assertion', clientAssertion);

    console.log(`token request: ${JSON.stringify(params, undefined, 2)}`)
    return this.http.post(hardcoded.backend.baseUrl + hardcoded.ob.tokenEndpoint, null, { params });
  }

  /**
   * Hit /accounts endpoint
   * @param token the bearer token
   */
  getAccounts(token: string): Observable<ResponseBankingAccountList> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('x-v', 'v1');

    return this.http.get(hardcoded.ob.baseUrl + hardcoded.ob.accountsEndpoint, { headers }) as any;
  }

  /**
   * Hit /balance endpoint for a particular *accountId*.
   * @param token the bearer token
   * @param accountId ID of the account to get balance of
   */
  getAccountBalance(token: string, accountId: string): Observable<ResponseBankingAccountsBalanceById> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('x-v', 'v1');

      accountId = "30080012343456";

    return this.http.get(hardcoded.ob.baseUrl + hardcoded.ob.accountsEndpoint + '/' + accountId + '/balance', { headers }) as any;
  }

  /**
   * Hit /transaction endpoint for a particular *accountId*.
   * @param token the bearer token
   * @param accountId ID of the account to get balance of
   */
  getTransactionsForAccount(token: string, accountId: string): Observable<ResponseBankingTransactionList> {
    const headers: HttpHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('x-v', 'v1');

    accountId = "30080012343456";

    return this.http.get(hardcoded.ob.baseUrl + hardcoded.ob.accountsEndpoint + '/' + accountId + '/transactions', { headers }) as any;
  }

}
