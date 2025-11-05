/**
 * Facilite l'import dans les controllers
 */

// User Use Cases
export { RegisterUser } from "./user/RegisterUser";
export type { RegisterUserResult } from "./user/RegisterUser";

export { LoginUser } from "./user/LoginUser";
export type { LoginUserResult } from "./user/LoginUser";

export { VerifyEmail } from "./user/VerifyEmail";
export type { VerifyEmailResult } from "./user/VerifyEmail";

// Account Use Cases
export { CreateAccount } from "./account/CreateAccount";
export type { CreateAccountResult } from "./account/CreateAccount";

export { TransferMoney } from "./account/TransferMoney";
export type { TransferMoneyResult } from "./account/TransferMoney";

// Investment Use Cases
export { PlaceInvestmentOrder } from "./investment/PlaceInvestmentOrder";
export type { PlaceInvestmentOrderResult } from "./investment/PlaceInvestmentOrder";

export { CancelInvestmentOrder } from "./investment/CancelInvestmentOrder";
export type { CancelInvestmentOrderResult } from "./investment/CancelInvestmentOrder";

export { GetAvailableStocks } from "./investment/GetAvailableStocks";
export type { GetAvailableStocksResult } from "./investment/GetAvailableStocks";

export { GetUserPortfolio } from "./investment/GetUserPortfolio";
export type { GetUserPortfolioResult } from "./investment/GetUserPortfolio";

// News Use Cases
export { CreateNews } from "./news/CreateNews";
export { GetNews } from "./news/GetNews";
export { UpdateNews } from "./news/UpdateNews";
export { DeleteNews } from "./news/DeleteNews";
export type { CreateNewsDTO, CreateNewsResult } from "./news/CreateNews";
export type { GetNewsResult } from "./news/GetNews";
export type { UpdateNewsDTO, UpdateNewsResult } from "./news/UpdateNews";
export type { DeleteNewsResult } from "./news/DeleteNews";
