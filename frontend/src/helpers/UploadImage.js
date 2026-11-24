import imageToBase64 from "./imageToBase64";

/**
 * Local image processor replacing legacy Cloudinary upload.
 * Converts local image file to base64 Data URL for zero external dependency.
 */
const UploadImage = async (image) => {
  if (!image) {
    return { url: "" };
  }
  
  try {
    const base64Url = await imageToBase64(image);
    return {
      url: base64Url,
      secure_url: base64Url,
    };
  } catch (error) {
    console.error("Error processing local image:", error);
    return { url: "" };
  }
};

export default UploadImage;
