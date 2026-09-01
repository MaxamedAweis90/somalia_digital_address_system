export function extractListData(responseData) {
  if (responseData?.data && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData)) {
    return responseData;
  }

  return [];
}

export function extractListFromResponse(response) {
  return extractListData(response?.data?.data);
}
