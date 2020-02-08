// angular
import { Component, OnInit } from '@angular/core';

//services
import { CdsService } from '../../services/cdsService/cds-service.service';

// external
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// models and statics
import { BankingAccount, BankingBalance, BankingTransaction } from 'src/app/models/models';
import * as hardcoded from 'src/assets/config/property.json';

import { ChartType, ChartOptions } from 'chart.js';

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

  myStateAccountData: Array<BankingAccount> = [];
  anzAccountData: Array<BankingAccount> = [];

  code: string; // auth code from params

  private fontFamily: string = "OswaldLight";
  private titleFontFamily: string = "OswaldLight";

  // Pie
  public pieChartOptions = {
    responsive: true,
    defaultFontFamily: this.fontFamily,
    title: {
      display: true,
      text: "Current Available Balances",
      fontFamily: this.fontFamily
    },
    legend: {
      position: 'bottom',
      labels: {
        fontFamily: this.fontFamily
      }
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    },
    tooltips: {
      titleFontFamily: this.titleFontFamily,
      bodyFontFamily: this.fontFamily
    }
  };
  public pieChartLabels: string[] = ["ANZ", "MyState"];
  public pieChartData: number[] = [888476.89, 789496.11];
  public pieChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['rgba(0,125,186,0.8)', 'rgba(97,187,71, 0.8)'],
    },
  ];

  public barChartPlugins = [];
  public pieChartPlugins = [];

  public barChartOptions = {
    responsive: true,
    defaultFontFamily: this.fontFamily,
    // We use these empty structures as placeholders for dynamic theming.
    legend: {
      position: 'bottom',
      labels: {
        fontFamily: this.fontFamily
      }
    },
    title: {
      display: true,
      text: "Historical Total Available Balance",
      fontFamily: this.fontFamily
    },
    scales: {
      yAxes: [{
        ticks: {
          fontFamily: this.fontFamily
        }
      }],
      xAxes: [{
        ticks: {
          fontFamily: this.fontFamily
        },
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
    labels: {
      fontFamily: this.fontFamily
    },
    tooltips: {
      titleFontFamily: this.titleFontFamily,
      bodyFontFamily: this.fontFamily
    }
  };
  public barChartLabels= ['Aug 19', 'Sep 19', 'Oct 19', 'Nov 19', 'Dec 19', 'Jan 20', 'Feb 20'];
  public barChartType = 'bar';
  public barChartLegend = true;

  public barChartData = [
    { 
      data: [1637972, 1077972, 677972, 1611972, 1344972, 1655972, 1677972], 
      label: 'Total Available Balance',
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
        'rgba(255, 19, 64, 0.5)'
      ],
      hoverBackgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 19, 64, 0.7)'
      ]
    }
  ];

  constructor(
    private cdsService: CdsService
  ) { }

  ngOnInit() {
    this.anzAccountData = [

      {
        accountId: "17648",
        creationDate: "asdasdsa",
        displayName: "asdassad",
        nickname: "asdsad",
        openStatus: "OPEN",
        isOwned: true,
        maskedNumber: "sadsadasd",
        productCategory: "asdasda",
        productName: "fsaaf"
        
      }
  
    ];

    this.myStateAccountData = [

      {
        accountId: "17648",
        creationDate: "asdasdsa",
        displayName: "asdassad",
        nickname: "asdsad",
        openStatus: "OPEN",
        isOwned: true,
        maskedNumber: "sadsadasd",
        productCategory: "asdasda",
        productName: "fsaaf"
        
      }
  
    ];

    localStorage.removeItem('accountTokens');
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
            this.addAccount(+balance.data.availableBalance);                                  // this array is 1:1 with accountData array
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

  addAccount(availableBalance: number) {
    this.pieChartLabels.push('CUA');
    this.pieChartData.push(availableBalance);
    this.pieChartColors[0].backgroundColor.push('rgba(0,177,194, 0.8)');
    this.barChartData[0].data[(this.barChartData[0].data).length-1] = this.barChartData[0].data[(this.barChartData[0].data).length-1] + availableBalance;
    this.barChartData[0].data.push(availableBalance);
  }

}
