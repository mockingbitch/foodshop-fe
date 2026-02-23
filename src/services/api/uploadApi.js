import axios from '@services/axios'

/**
 * Upload API - theo Postman FoodShop-API.
 * Images: images[]. Restaurant: outside_images[], inside_images[]. Food: main_image, extra_images[].
 */
/** type cho upload: restaurant | food | news */
const UPLOAD_TYPES = ['restaurant', 'food', 'news']

export const uploadApi = {
  uploadImages: (files, type = 'news') => {
    const formData = new FormData()
    ;(Array.isArray(files) ? files : [files]).forEach((file) => {
      formData.append('images[]', file)
    })
    if (UPLOAD_TYPES.includes(type)) {
      formData.append('type', type)
    }
    return axios.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadRestaurantImages: (outsideImages = [], insideImages = []) => {
    const formData = new FormData()
    formData.append('type', 'restaurant')
    outsideImages.forEach((file) => formData.append('outside_images[]', file))
    insideImages.forEach((file) => formData.append('inside_images[]', file))
    return axios.post('/upload/restaurant-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadFoodImages: (mainImage, extraImages = []) => {
    const formData = new FormData()
    formData.append('type', 'food')
    if (mainImage) formData.append('main_image', mainImage)
    ;(Array.isArray(extraImages) ? extraImages : []).forEach((file) => {
      formData.append('extra_images[]', file)
    })
    return axios.post('/upload/food-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
