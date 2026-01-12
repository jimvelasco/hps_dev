export const getAWSResource = (hoa, resourceType) => {
  switch (resourceType) {
    case 'BI':
      return hoa?.background_image_url || null;
    case 'OTC':
      return `${hoa?.hoaid || 'hoa'}-owner-terms-conditions.pdf`;
    case 'RTC':
      return `${hoa?.hoaid || 'hoa'}-renter-terms-conditions.pdf`;
    default:
      return null;
  }
};
