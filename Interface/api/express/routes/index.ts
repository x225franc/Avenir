import { Router } from "express";
import userRoutes from "./user.routes";
import accountRoutes from "./account.routes";
import transactionRoutes from "./transaction.routes";
import transferRoutes from "./transfer.routes";
import adminRoutes from "./admin.routes";
import advisorRoutes from "./advisor.routes";
import operationRoutes from "./operation.routes";
import investmentRoutes from "./investment.routes";
import newsRoutes from "./news.routes";

const router = Router();

// Montage des routes
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/transactions", transactionRoutes);
router.use("/transfers", transferRoutes);
router.use("/admin", adminRoutes);
router.use("/advisor", advisorRoutes);
router.use("/operations", operationRoutes);
router.use("/investment", investmentRoutes);
router.use("/news", newsRoutes);

export default router;
