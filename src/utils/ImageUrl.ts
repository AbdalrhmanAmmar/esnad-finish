export const getImageUrl = (imagePath: string | null | undefined): string => {
    const BASE_URL = "http://localhost:4000/"; // يمكنك تعديل هذا إلى عنوان السيرفر الخاص بك
    return imagePath ? `${BASE_URL}${imagePath}` : "";
}