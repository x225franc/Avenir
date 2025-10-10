/**
 * Barrel export pour tous les Use Cases
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

// Transaction Use Cases
export { TransferMoney } from "./transaction/TransferMoney";
export type { TransferMoneyResult } from "./transaction/TransferMoney";
