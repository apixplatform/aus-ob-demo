// angular
import { Component, OnInit } from '@angular/core';

//services
import { CdsService } from '../../services/cdsService/cds-service.service';

// external
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// models and statics
import { BankingAccount, BankingBalance, BankingTransaction } from 'src/app/models/models';
import * as hardcoded from 'src/assets/hardcoded.json';

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
    if (localStorage.getItem('accountTokens')) {
      this.accountTokens = JSON.parse(localStorage.getItem('accountTokens'));
    }

    this.code = this.getCode(window.location.href);
    if (this.code) {
      this.blockUI.start();

      this.cdsService.getJwtToken().subscribe(jwtToken => {
        console.log('jwtToken', jwtToken);

        this.cdsService.getAccountToken(this.code, jwtToken).subscribe(response => {
          console.log(response);
          this.accountTokens.push(response.access_token);
          localStorage.setItem('accountTokens', JSON.stringify(this.accountTokens));

          this.loadData();
        });
      });
    } else {
      if (this.accountTokens.length >= 0) {
        this.loadData();
      }
    }
  }

  loadData() {
    this.accountTokens.forEach(token => {
      this.cdsService.getAccounts(token).subscribe(accountList => {
        console.log(accountList);

        this.accountData = accountList.data.accounts;

        console.log(this.accountData);

        this.accountData.forEach((account, index) => {
          this.cdsService.getAccountBalance(token, account.accountId).subscribe(balance => {
            this.accountBalances.push(balance.data);

            if (index === this.accountData.length - 1) {
              this.blockUI.stop();
            }
          });

        });

      });
    });
  }

  getCode(href: string): string {
    if (href.includes('code')) {
      const startPos: number = href.search('code=') + 'code='.length;
      let code = href.slice(startPos);
      const endPos: number = href.slice(startPos).search('&');
      code = code.slice(0, endPos);
      console.log('code', code);
      return code;
    }

    return undefined;
  }

  goToConsentFlow() {
    this.blockUI.start();
    window.location.href = hardcoded.apiRoutes.requestAuthCodeUrl;
  }

  loadTransactions(tokenIndex: number, accountId: string) {
    this.blockUI.start();
    this.cdsService.getTransactionsForAccount(this.accountTokens[tokenIndex], accountId).subscribe(transactionList => {
      console.log(transactionList);

      transactionList.data.transactions.forEach(transaction => {
        transaction.postingDateTime = new Date(transaction.postingDateTime).toLocaleDateString();
      });

      this.accountTransactions = transactionList.data.transactions;

      this.blockUI.stop();
    });
  }

}
