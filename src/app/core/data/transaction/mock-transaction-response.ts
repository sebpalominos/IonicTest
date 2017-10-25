import { TransactionListResponse, TransactionResponse } from './transaction-response';

export const TRANSACTION_RESPONSES: TransactionListResponse = {
   "items": [
      <TransactionResponse> {
         "id": 3850,
         "accountId": 47,
         "recurrenceId": null,
         "date": 1486080000000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "DEBIT",
         "amount": 135.1,
         "currencyCode": "EUR",
         "description": " Against the 20",
         "categorisations": {
            "items": [],
            "primaryCategory": null
         },
         "valid": false
      },
      <TransactionResponse> {
         "id": 3851,
         "accountId": 47,
         "recurrenceId": null,
         "date": 1486080000000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "CREDIT",
         "amount": 1.75,
         "currencyCode": "EUR",
         "description": "ABC INVESTMENTS",
         "categorisations": {
            "items": [],
            "primaryCategory": null
         },
         "valid": false
      },
      <TransactionResponse> {
         "id": 4802,
         "accountId": 51,
         "recurrenceId": null,
         "date": 1486080000000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "DEBIT",
         "amount": 135.1,
         "currencyCode": "EUR",
         "description": " Against the 20",
         "categorisations": {
            "items": [],
            "primaryCategory": null
         },
         "valid": false
      },
      <TransactionResponse> {
         "id": 4803,
         "accountId": 51,
         "recurrenceId": null,
         "date": 1486080000000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "CREDIT",
         "amount": 1.75,
         "currencyCode": "EUR",
         "description": "COMPUTERSHARE INVESTO",
         "categorisations": {
            "items": [],
            "primaryCategory": null
         },
         "valid": false
      },
      <TransactionResponse> {
         "id": 3756,
         "accountId": 47,
         "recurrenceId": null,
         "date": 1479081600000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "DEBIT",
         "amount": 200,
         "currencyCode": "EUR",
         "description": "ATM BOI 90344442 12/11 2",
         "categorisations": {
            "items": [
               {
                  "status": "SYSTEM_APPROVED",
                  "category": {
                     "id": 173,
                     "description": "Cash withdrawal"
                  }
               }
            ],
            "primaryCategory": {
               "id": 173,
               "description": "Cash withdrawal"
            }
         },
         "valid": true
      },
      <TransactionResponse> {
         "id": 4307,
         "accountId": 49,
         "recurrenceId": null,
         "date": 1479081600000,
         "type": "STATED",
         "status": "COMPLETE",
         "flow": "DEBIT",
         "amount": 25.01,
         "currencyCode": "EUR",
         "description": "SUPERVALU",
         "categorisations": {
            "items": [],
            "primaryCategory": null
         },
         "valid": false
      },
   ]
};