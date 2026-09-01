import { SearchService } from "../service/search.service.js";
import { getErrorMessage } from "../utils/prisma-error.utils.js";

export const searchRegistry = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const data = await SearchService.searchRegistry({ query: q, limit });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
