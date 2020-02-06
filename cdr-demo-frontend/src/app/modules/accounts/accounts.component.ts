// angular
import { Component, OnInit } from '@angular/core';

//services
import { CdsService } from '../../services/cdsService/cds-service.service';

// external
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// models and statics
import { BankingAccount, BankingBalance, BankingTransaction } from 'src/app/models/models';
import * as hardcoded from 'src/assets/config/property.json';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI; // block-ui

  // storage arrays
  accountTokens: Array<string> = [];
  accountData: Array<BankingAccount> = [];
  accountBalances: Array<BankingBalance> = [];
  accountTransactions: Array<BankingTransaction> = [];

  code: string; // auth code from params

  constructor(
    private cdsService: CdsService
  ) { }

  ngOnInit() {
    // check localStorage for existing accountTokens array
    if (localStorage.getItem('accountTokens')) {
      this.accountTokens = JSON.parse(localStorage.getItem('accountTokens'));
    }

    // if there is a code parameter in the URL, store it
    this.code = this.getCode(window.location.href);
    if (this.code) {
      this.blockUI.start();

      // get client assertion
      this.cdsService.getClientAssertion().subscribe(clientAssertion => {
        console.log('clientAssertion: ', clientAssertion);

        // post code and client assertion to get account access token
        this.cdsService.getAccountToken(this.code, clientAssertion.data).subscribe(response => {
          console.log(`token response: ${JSON.stringify(response, undefined, 2)}`);
          if (!this.accountTokens.includes(response.access_token)) {  // if the token is not already in the array
            this.accountTokens.push(response.access_token);           // push the new access token to the array of account tokens
          }
          localStorage.setItem('accountTokens', JSON.stringify(this.accountTokens));  // finally, update localStorage

          this.loadData();  // call CDR APIs and load data into frontend
        });
      });
    } else {                                // if no code parameter
      if (this.accountTokens.length >= 0) { // if there are existing accountTokens from localStorage
        this.loadData();                    // call CDR APIs and load data into frontend
      }
    }
  }

  /**
   * Call the account and balance endpoints and populate storage arrays to reflect in frontend
   */
  loadData() {
    this.accountTokens.forEach(token => {
      this.cdsService.getAccounts(token).subscribe(accountList => {   // get all the accounts from all the tokens in the
        console.log('GET /banking/accounts: ', JSON.stringify(accountList, undefined, 2));                                     // accountToken array

        accountList.data.accounts.forEach(account => {                // store the token with the account details to call later
          account.token = token;
        });

        this.accountData = this.accountData.concat(accountList.data.accounts);           // add the account details to the account data array

        // console.log(this.accountData);

        this.accountData.forEach((account, index) => {                // load balances from all accounts in the account data array
          this.cdsService.getAccountBalance(token, account.accountId).subscribe(balance => {
            console.log(`GET /banking/accounts/${account.accountId}/balance: `, JSON.stringify(balance, undefined, 2));
            this.accountBalances.push(balance.data);                  // push each balance to the accountBalance array
                                                                      // this array is 1:1 with accountData array
            if (index === this.accountData.length - 1) {              // i.e. balance of accountData[i] is accountBalance[i]
              this.blockUI.stop();
            }
          });

        });

      });
    });
  }

  /**
   * Utility function to check the window URL for a code parameter.
   * This cannot be done using activatedRoute.params, because the Identity Server returns parameters with a '#' instead of a '?'.
   * Therefore, a custom function is needed.
   */
  getCode(href: string): string {
    // look for 'code; keyword
    if (href.includes('code')) {
      const startPos: number = href.search('code=') + 'code='.length; // record starting position of code value
      let code = href.slice(startPos);                                // slice the url from there to the end of the url
      const endPos: number = href.slice(startPos).search('&');        // record the position of the next '&' (i.e. the end of the parameter)
      code = code.slice(0, endPos);                                   // slice the url and get the code
      console.log('code: ', code);
      return code;                                                    // return it
    }

    return undefined;                                                 // return 'undefined' if there is no code parameter
  }

  /** Utility function that redirects to Identity Server consent flow using hardcoded route from property.json */
  goToConsentFlow() {
    this.blockUI.start();
    this.cdsService.getAuthorizeUrl().subscribe(data => {
      console.log(`authorizeUrl: ${data.data}`);
      window.location.href = data.data;
    });
  }

  /**
   * Loads a particular account's transactions and populates the frontend modal dialog. Called from frontend.
   * @param accountId the account ID
   * @param token the account's token
   */
  loadTransactions(accountId: string, token?: string) {
    this.blockUI.start();
    if (token) {
      this.cdsService.getTransactionsForAccount(token, accountId).subscribe(transactionList => {  // call transactions endpoint
        console.log(`GET /banking/accounts/${accountId}/transactions: `, JSON.stringify(transactionList, undefined, 2));                                                             // get list

        transactionList.data.transactions.forEach(transaction => {
          transaction.postingDateTime = new Date(transaction.postingDateTime).toLocaleDateString(); // format Date for readability
        });

        this.accountTransactions = transactionList.data.transactions; // load transaction data into frontend-facing variable

        this.blockUI.stop();
      });
    }
  }

}
