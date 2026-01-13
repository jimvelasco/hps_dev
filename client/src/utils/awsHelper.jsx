export const getAWSResource = (hoa, resourceType) => {
  //"http://hoaparking.s3.amazonaws.com/YV/background_image.jpg
  let awsbucket = 'https://hoaparking.s3.amazonaws.com'; // this would be in the hoa instead of the image
  let pdf_filename = '';
  switch (resourceType) {
    case 'BI':
      const image_filename = `${awsbucket}/${hoa.hoaid}/background-image.jpg`;
    //  console.log('getAWSResource image filename', image_filename);
      return image_filename;
      //return hoa?.background_image_url || null;
    case 'OTC':
      pdf_filename = `${awsbucket}/${hoa.hoaid}/OWNER-terms-conditions.pdf`;
     //console.log('pdf filename', pdf_filename);
      return pdf_filename;
    case 'RTC':
       pdf_filename = `${awsbucket}/${hoa.hoaid}/RENTER-terms-conditions.pdf`;
      return pdf_filename;
    default:
      return null;
  }
};
