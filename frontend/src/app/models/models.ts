export class ResponseBankingAccountList {
    data: ResponseBankingAccountData;
    links: LinksPaginated;
    meta: MetaPaginated;
}

export class ResponseBankingAccountsBalanceById {
    data: BankingBalance;
    links: Links;
    meta: any;
}

export class ResponseBankingTransactionList {
    data: ResponseBankingTransactionData;
    links: LinksPaginated;
    meta: MetaPaginated;
}

export class ResponseBankingTransactionData {
    transactions: Array<BankingTransaction>;
}

export class BankingTransaction {
    accountId: string;
    transactionId: string;
    isDetailAvailable: boolean;
    type: string;
    status: string;
    description: string;
    postingDateTime: string;
    valueDateTime: string;
    executionDateTime: string;
    amount: string;
    currency: string;
    reference: string;
    merchantName: string;
    merchantCategoryCode: string;
    billerCode: string;
    billerName: string;
    crn: string;
    apcaNumber: string;
}

export class Links {
    self: string
}

export class BankingBalance {
    accountId: string;
    currentBalance: string;
    availableBalance: string;
    creditLimit: string;
    amortisedLimit: string;
    currency: string;
    purses: Array<BankingBalancePurse>;
}

export class BankingBalancePurse {
    amount: string;
    currency: string;
}

export class ResponseBankingAccountData {
    accounts: Array<BankingAccount>;
}

export class BankingAccount {
    accountId: string;
    creationDate: string;
    displayName: string;
    nickname: string;
    openStatus: string;
    isOwned: boolean;
    maskedNumber: string;
    productCategory: string;
    productName: string;
}

export class LinksPaginated {
    self: string;
    first: string;
    prev: string;
    next: string;
    last: string;
}

export class MetaPaginated {
    totalRecords: number;
    totalPages: number;
}
