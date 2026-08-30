import { DashboardService } from "../service/dashboard.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await DashboardService.getSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
