/**
 * INDEX PRINCIPAL
 */

// ========================================
// USER USE CASES + DTOs
// ========================================
export { RegisterUser } from "./user/RegisterUser";
export type { RegisterUserResult, RegisterUserDTO } from "./user/RegisterUser";

export { LoginUser } from "./user/LoginUser";
export type { LoginUserResult, LoginUserDTO } from "./user/LoginUser";

export { VerifyEmail } from "./user/VerifyEmail";
export type { VerifyEmailResult } from "./user/VerifyEmail";

export { RequestPasswordReset } from "./user/RequestPasswordReset";

export { ResetPassword } from "./user/ResetPassword";

// ========================================
// ACCOUNT USE CASES + DTOs
// ========================================
export { CreateAccount } from "./account/CreateAccount";
export type { CreateAccountResult, CreateAccountDTO } from "./account/CreateAccount";

export { DepositMoney } from "./account/DepositMoney";
export type { DepositMoneyDTO } from "./account/DepositMoney";

export { WithdrawMoney } from "./account/WithdrawMoney";
export type { WithdrawMoneyDTO } from "./account/WithdrawMoney";

export { TransferMoney as TransferMoneyAccount } from "./account/TransferMoney";
export type { TransferMoneyResult, TransferMoneyDTO as TransferMoneyAccountDTO } from "./account/TransferMoney";

export { ApplyDailyInterest } from "./account/ApplyDailyInterest";

// ========================================
// TRANSACTION USE CASES + DTOs
// ========================================
export { TransferMoney } from "./transaction/TransferMoney";
export type { TransferMoneyDTO as TransferMoneyTransactionDTO } from "./transaction/TransferMoney";

// ========================================
// INVESTMENT USE CASES + DTOs
// ========================================
export { PlaceInvestmentOrder } from "./investment/PlaceInvestmentOrder";
export type { PlaceInvestmentOrderResult, PlaceInvestmentOrderDTO } from "./investment/PlaceInvestmentOrder";

export { CancelInvestmentOrder } from "./investment/CancelInvestmentOrder";
export type { CancelInvestmentOrderResult, CancelInvestmentOrderDTO } from "./investment/CancelInvestmentOrder";

export { GetAvailableStocks } from "./investment/GetAvailableStocks";
export type { GetAvailableStocksResult } from "./investment/GetAvailableStocks";

export { GetUserPortfolio } from "./investment/GetUserPortfolio";
export type { GetUserPortfolioResult, GetUserPortfolioDTO } from "./investment/GetUserPortfolio";

// ========================================
// CREDIT USE CASES
// ========================================
export { GrantCredit } from "./credit/GrantCredit";
export { GetUserCredits } from "./credit/GetUserCredits";
export { ProcessMonthlyPayments } from "./credit/ProcessMonthlyPayments";

// ========================================
// ADMIN USE CASES + DTOs
// ========================================
export { CreateStock } from "./admin/CreateStock";
export type { CreateStockDTO } from "./admin/CreateStock";

export { UpdateStock } from "./admin/UpdateStock";
export type { UpdateStockDTO } from "./admin/UpdateStock";

export { DeleteStock } from "./admin/DeleteStock";
export { GetAllStocks } from "./admin/GetAllStocks";
export { GetSavingsRate } from "./admin/GetSavingsRate";
export { UpdateSavingsRate } from "./admin/UpdateSavingsRate";

// ========================================
// NEWS USE CASES + DTOs
// ========================================
export { CreateNews } from "./news/CreateNews";
export type { CreateNewsResult, CreateNewsDTO } from "./news/CreateNews";

export { GetNews } from "./news/GetNews";
export type { GetNewsResult } from "./news/GetNews";

export { UpdateNews } from "./news/UpdateNews";
export type { UpdateNewsResult, UpdateNewsDTO } from "./news/UpdateNews";

export { DeleteNews } from "./news/DeleteNews";
export type { DeleteNewsResult } from "./news/DeleteNews";

// ========================================
// MESSAGIE USE CASES (Client-Advisor)
// ========================================
export { SendMessage } from "./message/SendMessage";
export { GetConversations } from "./message/GetConversations";
export { GetConversation } from "./message/GetConversation";
export { AssignConversation } from "./message/AssignConversation";
export { TransferConversation } from "./message/TransferConversation";
export { CloseConversation } from "./message/CloseConversation";
export { MarkConversationAsRead } from "./message/MarkConversationAsRead";
export { CheckOpenConversation } from "./message/CheckOpenConversation";

// ========================================
// INTERNAL MESSAGING USE CASES (Staff)
// ========================================
export { SendInternalMessage } from "./internal-message/SendInternalMessage";
export { GetInternalMessages } from "./internal-message/GetInternalMessages";
export { GetStaffMembers } from "./internal-message/GetStaffMembers";
