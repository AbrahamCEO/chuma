// Cloudinary Configuration
// To set up:
// 1. Go to Cloudinary Console: https://console.cloudinary.com/
// 2. Navigate to Settings > Upload
// 3. Scroll to "Upload presets" and click "Add upload preset"
// 4. In the form:
//    - Set "Upload preset name" to "chuma_videos"
//    - Change "Signing Mode" to "Unsigned"
//    - Click Save
// 5. Copy the exact preset name and paste it below

export const cloudinaryConfig = {
    cloudName: 'difgebvgj',
    uploadPreset: 'chuma_videos',  // Must match exactly what you set in the Cloudinary console
};

export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`;
